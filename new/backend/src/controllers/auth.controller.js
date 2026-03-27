import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const registerCustomer = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile) {
      return sendError(res, "Name and mobile are required", 400);
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { mobile },
    });

    if (existingCustomer) {
      return sendError(res, "Customer already exists with this mobile number", 409);
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email: email || null,
        password: hashedPassword,
      },
    });

    // Link any existing legacy offline purchases by mobile
    await prisma.offlinePurchase.updateMany({
      where: { mobile, customerId: null },
      data: { customerId: customer.id }
    });

    const customerData = serializePrisma(customer);
    delete customerData.password;

    return sendSuccess(res, customerData, "Customer registered successfully", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile) {
      return sendError(res, "Mobile number is required", 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { mobile },
      include: {
        addresses: true,
      },
    });

    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }

    if (customer.password && password) {
      const isPasswordValid = await bcrypt.compare(password, customer.password);
      if (!isPasswordValid) {
        return sendError(res, "Invalid password", 401);
      }
    } else if (customer.password && !password) {
      return sendError(res, "Password is required for this account", 400);
    }

    const customerData = serializePrisma(customer);
    delete customerData.password;

    return sendSuccess(
      res,
      {
        token: "mock-jwt-token",
        customer: customerData,
      },
      "Login successful",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getProfile = async (req, res) => {
  try {
    const { customerId, mobile } = req.query;

    const query = {
      include: {
        addresses: true,
        orders: {
          include: {
            items: true,
            trackingEvents: true,
          },
          orderBy: { createdAt: "desc" },
        },
        offlinePurchases: {
          include: {
            items: true,
            vendor: true,
          },
          orderBy: { purchaseDate: "desc" },
        },
        rewardTransactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    };

    const customer = customerId
      ? await prisma.customer.findUnique({
          where: { id: customerId },
          ...query,
        })
      : mobile
        ? await prisma.customer.findUnique({
            where: { mobile },
            ...query,
          })
        : await prisma.customer.findFirst({
            ...query,
            orderBy: { createdAt: "asc" },
          });

    if (!customer) {
      return sendError(res, "Customer profile not found", 404);
    }

    // Safety: Link any unlinked offline purchases now
    await prisma.offlinePurchase.updateMany({
      where: { mobile: customer.mobile, customerId: null },
      data: { customerId: customer.id }
    });

    const customerData = serializePrisma(customer);
    
    // Replace relationship data with full mobile-based fetch to be 100% sure
    const allOffline = await prisma.offlinePurchase.findMany({
      where: { mobile: customer.mobile },
      include: { items: true, vendor: true },
      orderBy: { purchaseDate: 'desc' }
    });
    
    customerData.offlinePurchases = serializePrisma(allOffline);
    delete customerData.password;

    return sendSuccess(res, customerData, "Customer profile fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
