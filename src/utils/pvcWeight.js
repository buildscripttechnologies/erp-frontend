export const PVC_WEIGHT_FACTOR = 0.00068;
export const NON_WOVEN_WIDTH_MM = 1600;
export const NON_WOVEN_DIVISOR = 1000000;

export const isPvcCategory = (category = "") =>
  category.trim().toLowerCase().includes("pvc");

export const calculatePvcWeight = (rollSizeInch, rollWidthMm, lengthMtr) => {
  const values = [rollSizeInch, rollWidthMm, lengthMtr].map(Number);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) return 0;
  return Number((values[0] * values[1] * values[2] * PVC_WEIGHT_FACTOR).toFixed(3));
};

export const isNonWovenCategory = (category = "") =>
  category.trim().toLowerCase().replace(/[-_]/g, " ").includes("non woven");

export const calculateNonWovenWeight = (gsm, lengthMtr) => {
  const values = [gsm, lengthMtr].map(Number);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) return 0;
  return Number(
    ((values[0] * values[1] * NON_WOVEN_WIDTH_MM) / NON_WOVEN_DIVISOR).toFixed(3)
  );
};
