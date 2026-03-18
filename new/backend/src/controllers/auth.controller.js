import prisma from "../lib/prisma.js";
import { serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const registerCustomer = async (req, res) => {
  try {
    const { name, mobile, email } = req.body;

    if (!name || !mobile) {
      return sendError(res, "Name and mobile are required", 400);
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { mobile },
    });

    if (existingCustomer) {
      return sendError(res, "Customer already exists with this mobile number", 409);
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email: email || null,
      },
    });

    return sendSuccess(res, serializePrisma(customer), "Customer registered successfully", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { mobile } = req.body;

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

    return sendSuccess(
      res,
      {
        token: "mock-jwt-token",
        customer: serializePrisma(customer),
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

    return sendSuccess(res, serializePrisma(customer), "Customer profile fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
