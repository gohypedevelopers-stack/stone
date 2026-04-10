import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";

const serializePrisma = (data) => JSON.parse(JSON.stringify(data));

export const registerVendor = async (req, res) => {
  try {
    const { 
      businessName, 
      ownerName, 
      email, 
      password, 
      contactNumber, 
      businessCategory, 
      storeAddress 
    } = req.body;

    if (!businessName || !email || !password || !contactNumber || !businessCategory || !storeAddress) {
      return sendError(res, "All fields are required", 400);
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (existingVendor) {
      return sendError(res, "Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await prisma.vendor.create({
      data: {
        businessName,
        ownerName,
        email,
        password: hashedPassword,
        contactNumber,
        businessCategory,
        storeAddress,
        approvalStatus: "PENDING", // Vendors created via registration start as PENDING
      },
    });

    const vendorData = { ...vendor };
    delete vendorData.password;

    return sendSuccess(res, serializePrisma(vendorData), "Registration successful. Awaiting admin approval.", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const vendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (!vendor) {
      return sendError(res, "Invalid credentials", 401);
    }

    if (vendor.approvalStatus !== "APPROVED") {
      return sendError(res, "Account pending approval. Please contact administrator.", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      return sendError(res, "Invalid credentials", 401);
    }

    const vendorData = { ...vendor };
    delete vendorData.password;

    return sendSuccess(
      res,
      {
        token: "vendor-jwt-token",
        vendor: serializePrisma(vendorData),
      },
      "Vendor Login successful"
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.query;

    if (!vendorId) {
      return sendError(res, "Vendor ID is required", 400);
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return sendError(res, "Vendor not found", 404);
    }

    const vendorData = { ...vendor };
    delete vendorData.password;

    return sendSuccess(res, serializePrisma(vendorData), "Vendor profile fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
