// utils/calc.js
export const calculateRate = (comp, qtyOverride = null) => {
  const category = (comp.category || "").toLowerCase();
  const qty = qtyOverride ?? (Number(comp.qty) || 0);

  // Fabric: uses height × width × qty × sqInchRate
  if (category === "fabric") {
    const height = Number(comp.height) || 0;
    const width = Number(comp.width) || 0;
    const sqInchRate = Number(comp.sqInchRate) || 0;

    return height && width && qty && sqInchRate
      ? Number((height * width * qty * sqInchRate).toFixed(2))
      : null;
  }

  // Accessories: rate per piece = itemRate / baseQty
  if (
    ["slider", "adjuster", "buckel", "dkadi", "accessories"].includes(category)
  ) {
    const baseQty = Number(comp.baseQty) || 0;
    const baseRate = Number(comp.itemRate) || 0;

    if (baseQty && baseRate && qty) {
      const perPieceRate = baseRate / baseQty;
      return Number((perPieceRate * qty).toFixed(2));
    }
    return null;
  }

  // Plastic / Non-woven: calculate per gram
  if (["plastic", "non-woven"].includes(category)) {
    const grams = comp.grams || 0;
    const baseQtyKg = Number(comp.baseQty) || 1; // baseQty is in KG
    const baseQtyGrams = baseQtyKg * 1000;

    if (!grams || !baseQtyGrams || !comp.itemRate) return null;

    // Rate = proportion of grams relative to baseQty in grams × itemRate
    return Number(((grams / baseQtyGrams) * comp.itemRate).toFixed(2));
  }

  if (category === "zipper") {
    const inches = qty; // qty here is already in inches
    const baseQtyMeter = Number(comp.baseQty) || 1; // baseQty in meters
    const baseQtyInches = baseQtyMeter * 39.37; // convert meters → inches

    if (!inches || !baseQtyInches || !comp.itemRate) return null;

    const perInchRate = comp.itemRate / baseQtyInches;
    return Number((perInchRate * inches).toFixed(2));
  }

  // fallback
  return comp.rate || null;
};
