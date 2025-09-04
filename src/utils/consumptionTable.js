export const generateConsumptionTable = (productDetails = []) => {
  const mergedRawMaterials = {};
  console.log("product details", productDetails);

  (productDetails || []).forEach((item) => {
    const sku = item.skuCode || "N/A";
    const category = (item.category || "N/A").toLowerCase();
    const qty = Number(item.qty) || 0;
    const width = Number(item.width) || 0;
    const height = Number(item.height) || 0;
    const grams = Number(item.grams) || 0;
    const panno = Number(item.panno) || 0;

    if (!mergedRawMaterials[sku]) {
      mergedRawMaterials[sku] = {
        skuCode: sku,
        itemName: item.itemName || "N/A",
        category,
        qty: 0,
        weight: 0,
      };
    }

    if (category === "zipper") {
      const totalInches = width * qty;
      mergedRawMaterials[sku].qty += totalInches / 39.37; // meters
    } else if (category === "fabric") {
      if (width && height && qty && panno) {
        const perRowA = Math.floor(panno / width);
        const rowsA = perRowA > 0 ? Math.ceil(qty / perRowA) : Infinity;
        const totalInchesA = rowsA * height;

        const perRowB = Math.floor(panno / height);
        const rowsB = perRowB > 0 ? Math.ceil(qty / perRowB) : Infinity;
        const totalInchesB = rowsB * width;

        const bestInches = Math.min(totalInchesA, totalInchesB);

        mergedRawMaterials[sku].qty += bestInches / 39.37;
      }
    } else if (["plastic", "non woven", "ld cord"].includes(category)) {
      mergedRawMaterials[sku].weight += grams / 1000;
      mergedRawMaterials[sku].qty += qty;
    } else if (
      [
        "slider",
        "bidding",
        "adjuster",
        "buckel",
        "dkadi",
        "accessories",
      ].includes(category)
    ) {
      mergedRawMaterials[sku].qty += qty;
    } else {
      mergedRawMaterials[sku].qty += qty;
    }
  });

  const consumptionTable = Object.values(mergedRawMaterials).map(
    (item, index) => {
      let weightDisplay = "N/A";
      let qtyDisplay = "N/A";

      if (["plastic", "non woven", "ld cord"].includes(item.category))
        weightDisplay = `${item.weight.toFixed(2)} kg`;

      if (["zipper", "fabric", "canvas", "cotton"].includes(item.category)) {
        qtyDisplay = `${Number(item.qty).toFixed(2)} m`;
      } else if (["plastic", "non woven", "ld cord"].includes(item.category)) {
        qtyDisplay = "N/A";
      } else if (
        [
          "slider",
          "bidding",
          "adjuster",
          "buckel",
          "dkadi",
          "accessories",
        ].includes(item.category)
      ) {
        qtyDisplay = item.qty;
      }
      return {
        skuCode: item.skuCode,
        itemName: item.itemName,
        category: item.category,
        weight: weightDisplay,
        qty: qtyDisplay,
      };
    }
  );

  // return Object.values(mergedRawMaterials).map((item) => ({
  //   skuCode: item.skuCode,
  //   itemName: item.itemName,
  //   category: item.category,
  //   qty: item.qty.toFixed(2),
  //   weight: item.weight.toFixed(2),
  // }));

  return consumptionTable;
};
