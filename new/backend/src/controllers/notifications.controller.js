import prisma from "../lib/prisma.js";
import {
  formatEnumOutput,
  normalizeEnumInput,
  serializePrisma,
} from "../utils/data.js";
import { sendError, sendSuccess } from "../utils/http.js";

export const listNotifications = async (req, res) => {
  try {
    const { audience } = req.query;

    const notifications = await prisma.notification.findMany({
      where: audience
        ? {
            audience: normalizeEnumInput(audience),
          }
        : undefined,
      include: {
        customer: true,
        vendor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(
      res,
      notifications.map((notification) =>
        serializePrisma({
          ...notification,
          audience: formatEnumOutput(notification.audience),
          channel: formatEnumOutput(notification.channel),
        }),
      ),
      "Notifications fetched",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
