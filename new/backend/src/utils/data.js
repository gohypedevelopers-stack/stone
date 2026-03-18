export const parseBoolean = (value) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
};

export const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeEnumInput = (value) => {
  if (!value) {
    return undefined;
  }

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

export const formatEnumOutput = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.toLowerCase();
};

export const serializePrisma = (value) => {
  if (Array.isArray(value)) {
    return value.map(serializePrisma);
  }

  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") {
      return value.toNumber();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializePrisma(nestedValue)]),
    );
  }

  return value;
};
