import prisma from "../lib/prisma.js";
import { formatEnumOutput, serializePrisma } from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const getRewardSummary = async (req, res) => {
  try {
    const { customerId, mobile } = req.query;

    const customer = customerId
      ? await prisma.customer.findUnique({ where: { id: customerId } })
      : mobile
        ? await prisma.customer.findUnique({ where: { mobile } })
        : await prisma.customer.findFirst({ orderBy: { createdAt: "asc" } });

    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }

    const ledger = await prisma.rewardTransaction.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(
      res,
      {
        customer: serializePrisma(customer),
        ledger: ledger.map((entry) =>
          serializePrisma({
            ...entry,
            type: formatEnumOutput(entry.type),
          }),
        ),
      },
      "Reward summary fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const redeemRewards = async (req, res) => {
  try {
    const { customerId, mobile, points } = req.body;
    const normalizedPoints = Number(points || 0);

    if (!normalizedPoints || normalizedPoints <= 0) {
      return sendError(res, "A valid points value is required", 400);
    }

    const customer = customerId
      ? await prisma.customer.findUnique({ where: { id: customerId } })
      : mobile
        ? await prisma.customer.findUnique({ where: { mobile } })
        : await prisma.customer.findFirst({ orderBy: { createdAt: "asc" } });

    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }

    if (customer.rewardPoints < normalizedPoints) {
      return sendError(res, "Insufficient reward points", 400);
    }

    const entry = await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          rewardPoints: {
            decrement: normalizedPoints,
          },
        },
      });

      return tx.rewardTransaction.create({
        data: {
          customerId: customer.id,
          type: "REDEEMED",
          source: "checkout",
          points: normalizedPoints,
        },
      });
    });

    return sendSuccess(
      res,
      serializePrisma({
        ...entry,
        type: formatEnumOutput(entry.type),
      }),
      "Reward points redeemed",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
