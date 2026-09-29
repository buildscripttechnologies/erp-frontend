export const PVC_WEIGHT_FACTOR = 0.00068;

export const isPvcCategory = (category = "") =>
  category.trim().toLowerCase().includes("pvc");

export const calculatePvcWeight = (rollSizeInch, rollWidthMm, lengthMtr) => {
  const values = [rollSizeInch, rollWidthMm, lengthMtr].map(Number);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) return 0;
  return Number((values[0] * values[1] * values[2] * PVC_WEIGHT_FACTOR).toFixed(3));
};
