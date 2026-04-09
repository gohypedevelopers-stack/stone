import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";

// Generates the initial admin account
export const seedAdmin = async (req, res) => {
  try {
    const adminCount = await prisma.admin.count();
    
    // Only allow seeding if no admin exists
    if (adminCount > 0) {
      return sendError(res, "Admin account already exists. Seeding not allowed.", 403);
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const adminData = { ...admin };
    delete adminData.password;

    return sendSuccess(res, adminData, "Admin seeded successfully", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return sendError(res, "Invalid credentials", 401);
    }

    const adminData = { ...admin };
    delete adminData.password;

    // Use mock JWT structure, similar to how customer auth responds.
    return sendSuccess(
      res,
      {
        token: "admin-jwt-token",
        admin: adminData,
      },
      "Admin Login successful"
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) {
      return sendError(res, "Admin ID is required", 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return sendError(res, "Admin not found", 404);
    }

    const adminData = { ...admin };
    delete adminData.password;

    return sendSuccess(res, adminData, "Admin profile fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
