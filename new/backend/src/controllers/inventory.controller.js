import prisma from "../lib/prisma.js";
import { normalizeEnumInput, serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

const LABEL_PREFIX = "LABEL";

const buildCode = (prefix = LABEL_PREFIX) =>
  `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now()
    .toString(36)
    .slice(-4)
    .toUpperCase()}`;

const parseDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseDecimalOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const getOutletManagerId = (req) =>
  req.headers["x-vendor-id"] ||
  req.headers["x-outlet-manager-id"] ||
  req.body?.vendorId ||
  req.query?.vendorId ||
  null;

const getAdminId = (req) =>
  req.headers["x-admin-id"] || req.body?.adminId || req.query?.adminId || null;

const outletInventoryInclude = {
  outlet: true,
  product: {
    include: {
      category: true,
    },
  },
  batch: true,
};

const stockMovementInclude = {
  outlet: true,
  product: {
    include: { category: true },
  },
  batch: true,
  performedBy: {
    select: {
      id: true,
      businessName: true,
      ownerName: true,
      email: true,
    },
  },
};

const resolveOutletManager = async (req) => {
  const vendorId = getOutletManagerId(req);

  if (!vendorId) {
    return {
      error: {
        message: "Outlet manager identity is required in x-vendor-id header",
        status: 401,
      },
    };
  }

  const manager = await prisma.vendor.findUnique({
    where: { id: String(vendorId) },
    include: { outlet: true },
  });

  if (!manager) {
    return { error: { message: "Outlet manager not found", status: 404 } };
  }

  if (manager.approvalStatus !== "APPROVED") {
    return {
      error: {
        message: "Outlet manager account is not approved",
        status: 403,
      },
    };
  }

  if (!manager.outletId || !manager.outlet) {
    return {
      error: {
        message: "No outlet assigned. Please contact admin.",
        status: 403,
      },
    };
  }

  if (manager.outlet.status !== "ACTIVE") {
    return {
      error: {
        message: "Assigned outlet is inactive",
        status: 403,
      },
    };
  }

  return { manager };
};

const fetchBatchForInventory = async (batchId) =>
  prisma.productBatch.findUnique({
    where: { id: batchId },
    include: {
      product: true,
    },
  });

const createMovement = async (tx, payload) =>
  tx.stockMovement.create({
    data: payload,
  });

export const createOutlet = async (req, res) => {
  try {
    const { name, code, address, city, state, pincode, status } = req.body;

    if (!name || !code) {
      return sendError(res, "Outlet name and code are required", 400);
    }

    const outlet = await prisma.outlet.create({
      data: {
        name,
        code: String(code).trim().toUpperCase(),
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        status: normalizeEnumInput(status) || "ACTIVE",
      },
    });

    return sendSuccess(res, serializePrisma(outlet), "Outlet created", 201);
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, "Outlet code already exists", 409);
    }
    return sendError(res, error.message, 500);
  }
};

export const listOutlets = async (_req, res) => {
  try {
    const outlets = await prisma.outlet.findMany({
      include: {
        managers: {
          select: {
            id: true,
            businessName: true,
            ownerName: true,
            email: true,
            contactNumber: true,
            approvalStatus: true,
          },
        },
        inventories: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const normalized = outlets.map((outlet) => ({
      ...serializePrisma(outlet),
      totalStock: outlet.inventories.reduce(
        (sum, inventory) => sum + (inventory.quantity || 0),
        0,
      ),
    }));

    return sendSuccess(res, normalized, "Outlets fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const assignOutletManager = async (req, res) => {
  try {
    const { outletId, vendorId } = req.params;

    const [outlet, vendor] = await Promise.all([
      prisma.outlet.findUnique({ where: { id: outletId } }),
      prisma.vendor.findUnique({ where: { id: vendorId } }),
    ]);

    if (!outlet) return sendError(res, "Outlet not found", 404);
    if (!vendor) return sendError(res, "Outlet manager not found", 404);

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { outletId },
      include: { outlet: true },
    });

    return sendSuccess(
      res,
      serializePrisma(updatedVendor),
      "Outlet manager assigned successfully",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createProductLabel = async (req, res) => {
  try {
    const {
      productId,
      batchNo,
      mrp,
      ingredients,
      productionDate,
      expiryDate,
      weight,
      unit,
      status,
    } = req.body;

    if (!productId || !batchNo) {
      return sendError(res, "Product and batch number are required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    if (product.status !== "ACTIVE") {
      return sendError(res, "Only active products can have labels", 400);
    }

    const adminId = getAdminId(req);
    const labelCode = buildCode("LABEL");
    const barcodeValue = buildCode("BAR");
    const qrValue = labelCode;

    const created = await prisma.productBatch.create({
      data: {
        productId,
        batchNo: String(batchNo).trim(),
        labelCode,
        barcodeValue,
        qrValue,
        mrp: parseDecimalOrNull(mrp) ?? product.defaultMrp ?? null,
        ingredients: ingredients || product.ingredients || null,
        productionDate: parseDateOrNull(productionDate),
        expiryDate: parseDateOrNull(expiryDate),
        weight: parseDecimalOrNull(weight) ?? product.defaultWeight ?? null,
        unit: unit || product.unit || null,
        status: normalizeEnumInput(status) || "ACTIVE",
        createdByAdminId: adminId || null,
      },
      include: {
        product: true,
      },
    });

    return sendSuccess(
      res,
      {
        ...serializePrisma(created),
        labelId: created.id,
      },
      "Product label created",
      201,
    );
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(
        res,
        "A label already exists for this batch or generated code",
        409,
      );
    }
    return sendError(res, error.message, 500);
  }
};

export const listProductLabels = async (req, res) => {
  try {
    const { productId, status } = req.query;

    const where = {};
    if (productId) where.productId = String(productId);
    if (status) where.status = normalizeEnumInput(status);

    const labels = await prisma.productBatch.findMany({
      where,
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, serializePrisma(labels), "Product labels fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getProductLabelById = async (req, res) => {
  try {
    const label = await prisma.productBatch.findUnique({
      where: { id: req.params.id },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    if (!label) return sendError(res, "Product label not found", 404);

    return sendSuccess(res, serializePrisma(label), "Product label fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getPrintableProductLabel = async (req, res) => {
  try {
    const label = await prisma.productBatch.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
      },
    });

    if (!label) return sendError(res, "Product label not found", 404);

    return sendSuccess(
      res,
      serializePrisma({
        labelId: label.id,
        labelCode: label.labelCode,
        barcodeValue: label.barcodeValue,
        qrValue: label.qrValue,
        batchNo: label.batchNo,
        mrp: label.mrp,
        ingredients: label.ingredients,
        productionDate: label.productionDate,
        expiryDate: label.expiryDate,
        weight: label.weight,
        unit: label.unit,
        product: {
          id: label.product.id,
          name: label.product.name,
          sku: label.product.sku || label.product.slug,
          image: label.product.imageUrls?.[0] || null,
        },
      }),
      "Printable label data fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateProductLabelStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) return sendError(res, "Status is required", 400);

    const label = await prisma.productBatch.update({
      where: { id: req.params.id },
      data: {
        status: normalizeEnumInput(status),
      },
      include: { product: true },
    });

    return sendSuccess(res, serializePrisma(label), "Product label updated");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const scanProductCode = async (req, res) => {
  try {
    const resolved = await resolveOutletManager(req);
    if (resolved.error) {
      return sendError(res, resolved.error.message, resolved.error.status);
    }

    const { code } = req.body;

    if (!code) {
      return sendError(res, "Scan code is required", 400);
    }

    const batch = await prisma.productBatch.findFirst({
      where: {
        OR: [
          { labelCode: String(code).trim() },
          { barcodeValue: String(code).trim() },
          { qrValue: String(code).trim() },
        ],
      },
      include: {
        product: true,
      },
    });

    if (!batch) {
      return sendError(res, "Invalid code. No product found for this barcode/QR.", 404);
    }

    if (batch.status !== "ACTIVE") {
      return sendError(res, "This label is inactive", 400);
    }

    if (batch.product.status !== "ACTIVE") {
      return sendError(res, "Product is inactive", 400);
    }

    const inventory = await prisma.outletInventory.findUnique({
      where: {
        outletId_productId_batchId: {
          outletId: resolved.manager.outletId,
          productId: batch.productId,
          batchId: batch.id,
        },
      },
    });

    const isExpired =
      batch.expiryDate && new Date(batch.expiryDate).getTime() < Date.now();

    return sendSuccess(
      res,
      serializePrisma({
        product: {
          id: batch.product.id,
          name: batch.product.name,
          sku: batch.product.sku || batch.product.slug,
          image: batch.product.imageUrls?.[0] || null,
          ingredients: batch.product.ingredients,
        },
        batch: {
          id: batch.id,
          batchNo: batch.batchNo,
          mrp: batch.mrp,
          ingredients: batch.ingredients,
          productionDate: batch.productionDate,
          expiryDate: batch.expiryDate,
          weight: batch.weight,
          unit: batch.unit,
          labelCode: batch.labelCode,
          barcodeValue: batch.barcodeValue,
          qrValue: batch.qrValue,
          isExpired,
        },
        currentOutletStock: inventory?.quantity || 0,
        outlet: {
          id: resolved.manager.outlet.id,
          name: resolved.manager.outlet.name,
          code: resolved.manager.outlet.code,
        },
      }),
      "Product scan resolved",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const mutateInventory = async ({
  req,
  movementType,
  quantitySign,
  defaultReferenceType,
}) => {
  const resolved = await resolveOutletManager(req);
  if (resolved.error) {
    return { error: resolved.error };
  }

  const { batchId, quantity, reason, referenceType, referenceId } = req.body;
  const parsedQuantity = parsePositiveInt(quantity);

  if (!batchId || !parsedQuantity) {
    return {
      error: {
        message: "Batch and positive quantity are required",
        status: 400,
      },
    };
  }

  const batch = await fetchBatchForInventory(batchId);
  if (!batch) {
    return { error: { message: "Product batch not found", status: 404 } };
  }

  if (batch.status !== "ACTIVE") {
    return { error: { message: "Product batch is inactive", status: 400 } };
  }

  if (batch.product.status !== "ACTIVE") {
    return { error: { message: "Product is inactive", status: 400 } };
  }

  if (
    quantitySign > 0 &&
    batch.expiryDate &&
    new Date(batch.expiryDate).getTime() < Date.now()
  ) {
    return {
      error: {
        message: "This batch is expired and cannot be added to inventory",
        status: 400,
      },
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const inventoryKey = {
      outletId_productId_batchId: {
        outletId: resolved.manager.outletId,
        productId: batch.productId,
        batchId: batch.id,
      },
    };

    const existing = await tx.outletInventory.findUnique({
      where: inventoryKey,
    });

    const previousQuantity = existing?.quantity || 0;
    const nextQuantity = previousQuantity + quantitySign * parsedQuantity;

    if (nextQuantity < 0) {
      throw new Error("Insufficient stock. Stock cannot become negative.");
    }

    const inventory = existing
      ? await tx.outletInventory.update({
          where: inventoryKey,
          data: {
            quantity: nextQuantity,
          },
          include: outletInventoryInclude,
        })
      : await tx.outletInventory.create({
          data: {
            outletId: resolved.manager.outletId,
            productId: batch.productId,
            batchId: batch.id,
            quantity: nextQuantity,
          },
          include: outletInventoryInclude,
        });

    await createMovement(tx, {
      outletId: resolved.manager.outletId,
      productId: batch.productId,
      batchId: batch.id,
      movementType,
      quantity: parsedQuantity,
      previousQuantity,
      newQuantity: nextQuantity,
      reason: reason || null,
      referenceType: normalizeEnumInput(referenceType) || defaultReferenceType,
      referenceId: referenceId || null,
      performedById: resolved.manager.id,
    });

    return {
      inventory,
      previousQuantity,
      newQuantity: nextQuantity,
      manager: resolved.manager,
      batch,
      quantity: parsedQuantity,
    };
  });

  return { data: result };
};

export const addOutletInventory = async (req, res) => {
  try {
    const result = await mutateInventory({
      req,
      movementType: "ADD",
      quantitySign: 1,
      defaultReferenceType: "SCAN",
    });

    if (result.error) {
      return sendError(res, result.error.message, result.error.status);
    }

    return sendSuccess(
      res,
      serializePrisma({
        productId: result.data.batch.productId,
        batchId: result.data.batch.id,
        outletId: result.data.manager.outletId,
        previousQuantity: result.data.previousQuantity,
        addedQuantity: result.data.quantity,
        newQuantity: result.data.newQuantity,
        inventory: result.data.inventory,
      }),
      "Stock added successfully",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const reduceOutletInventory = async (req, res) => {
  try {
    const requestedMovementType =
      normalizeEnumInput(req.body.movementType) || "REDUCE";

    const result = await mutateInventory({
      req,
      movementType: requestedMovementType,
      quantitySign: -1,
      defaultReferenceType: "MANUAL",
    });

    if (result.error) {
      return sendError(res, result.error.message, result.error.status);
    }

    return sendSuccess(
      res,
      serializePrisma({
        productId: result.data.batch.productId,
        batchId: result.data.batch.id,
        outletId: result.data.manager.outletId,
        previousQuantity: result.data.previousQuantity,
        reducedQuantity: result.data.quantity,
        newQuantity: result.data.newQuantity,
        inventory: result.data.inventory,
      }),
      "Stock reduced successfully",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const listOutletInventory = async (req, res) => {
  try {
    const resolved = await resolveOutletManager(req);
    if (resolved.error) {
      return sendError(res, resolved.error.message, resolved.error.status);
    }

    const inventory = await prisma.outletInventory.findMany({
      where: {
        outletId: resolved.manager.outletId,
      },
      include: outletInventoryInclude,
      orderBy: [{ updatedAt: "desc" }],
    });

    return sendSuccess(
      res,
      serializePrisma({
        outlet: resolved.manager.outlet,
        items: inventory,
      }),
      "Outlet inventory fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const listOutletStockMovements = async (req, res) => {
  try {
    const resolved = await resolveOutletManager(req);
    if (resolved.error) {
      return sendError(res, resolved.error.message, resolved.error.status);
    }

    const movements = await prisma.stockMovement.findMany({
      where: {
        outletId: resolved.manager.outletId,
      },
      include: stockMovementInclude,
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(
      res,
      serializePrisma({
        outlet: resolved.manager.outlet,
        items: movements,
      }),
      "Outlet stock movements fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminOutletInventory = async (req, res) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { outletId: req.params.outletId }
    });

    let inventory = [];
    if (vendor) {
      const stocks = await prisma.vendorStock.findMany({
        where: { vendorId: vendor.id },
        include: { product: true }
      });
      
      const groupedMap = stocks.reduce((acc, s) => {
        const name = s.product.name;
        if (!acc[name]) {
          acc[name] = {
            id: s.id,
            product: s.product,
            batch: { batchNo: "N/A", expiryDate: null },
            quantity: 0
          };
        }
        acc[name].quantity += s.quantity;
        return acc;
      }, {});
      
      inventory = Object.values(groupedMap);
    }

    return sendSuccess(res, serializePrisma(inventory), "Outlet inventory fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminInventorySummary = async (_req, res) => {
  try {
    const inventories = await prisma.vendorStock.findMany({
      include: {
        product: true,
        vendor: true
      },
    });

    const grouped = inventories.reduce((acc, entry) => {
      const key = entry.product.name;
      if (!acc[key]) {
        acc[key] = {
          productId: entry.productId,
          productName: entry.product.name,
          productSlug: entry.product.slug,
          totalStock: 0,
          outlets: [],
        };
      }

      acc[key].totalStock += entry.quantity || 0;
      acc[key].outlets.push({
        outletId: entry.vendor?.outletId,
        outletName: entry.vendor?.businessName,
        batchId: null,
        batchNo: "N/A",
        quantity: entry.quantity,
        expiryDate: null,
      });

      return acc;
    }, {});

    return sendSuccess(
      res,
      serializePrisma(Object.values(grouped)),
      "Inventory summary fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminStockMovements = async (req, res) => {
  try {
    const { outletId, movementType } = req.query;
    const where = {};

    if (outletId) where.outletId = String(outletId);
    if (movementType) where.movementType = normalizeEnumInput(movementType);

    const movements = await prisma.stockMovement.findMany({
      where,
      include: stockMovementInclude,
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, serializePrisma(movements), "Stock movements fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
