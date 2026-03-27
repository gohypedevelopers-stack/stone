import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/http.js";

const POINTS_DEFAULTS = {
  reward_points_per_amount: "2",
  reward_amount_threshold: "100",
};

async function getSetting(key) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? POINTS_DEFAULTS[key] ?? null;
}

export const getPointsSettings = async (req, res) => {
  try {
    const [pointsPerAmount, amountThreshold] = await Promise.all([
      getSetting("reward_points_per_amount"),
      getSetting("reward_amount_threshold"),
    ]);

    return sendSuccess(
      res,
      {
        pointsPerAmount: Number(pointsPerAmount),
        amountThreshold: Number(amountThreshold),
      },
      "Points settings fetched"
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updatePointsSettings = async (req, res) => {
  try {
    const { pointsPerAmount, amountThreshold } = req.body;

    if (
      pointsPerAmount == null ||
      amountThreshold == null ||
      Number(pointsPerAmount) < 0 ||
      Number(amountThreshold) <= 0
    ) {
      return sendError(
        res,
        "Valid pointsPerAmount (>= 0) and amountThreshold (> 0) are required",
        400
      );
    }

    await Promise.all([
      prisma.setting.upsert({
        where: { key: "reward_points_per_amount" },
        update: { value: String(pointsPerAmount) },
        create: { key: "reward_points_per_amount", value: String(pointsPerAmount) },
      }),
      prisma.setting.upsert({
        where: { key: "reward_amount_threshold" },
        update: { value: String(amountThreshold) },
        create: { key: "reward_amount_threshold", value: String(amountThreshold) },
      }),
    ]);

    return sendSuccess(
      res,
      {
        pointsPerAmount: Number(pointsPerAmount),
        amountThreshold: Number(amountThreshold),
      },
      "Points settings updated"
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Helper: get dynamic reward points for an amount
export const calculateRewardPoints = async (totalAmount) => {
  const [pointsPerAmount, amountThreshold] = await Promise.all([
    getSetting("reward_points_per_amount"),
    getSetting("reward_amount_threshold"),
  ]);

  const pts = Number(pointsPerAmount);
  const threshold = Number(amountThreshold);

  if (threshold <= 0 || pts <= 0) return 0;
  return Math.floor(totalAmount / threshold) * pts;
};

