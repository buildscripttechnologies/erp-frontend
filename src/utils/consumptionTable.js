import { fabric, plastic, slider, zipper } from "../data/dropdownData";

export const generateConsumptionTable = (productDetails = []) => {
  const mergedRawMaterials = {};
  console.log("product details", productDetails);

  (productDetails || []).forEach((item) => {
    const sku = item.skuCode || "";
    const category = item.category || "";
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

    if (zipper.includes(category.toLowerCase())) {
      const totalInches = width * qty;
      mergedRawMaterials[sku].qty += totalInches / 39.37; // meters
    } else if (fabric.includes(category.toLowerCase())) {
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
    } else if (plastic.includes(category.toLowerCase())) {
      mergedRawMaterials[sku].weight += grams / 1000;
      mergedRawMaterials[sku].qty += qty;
    } else if (slider.includes(category.toLowerCase())) {
      mergedRawMaterials[sku].qty += qty;
    } else {
      mergedRawMaterials[sku].qty += qty;
    }
  });

  const consumptionTable = Object.values(mergedRawMaterials).map(
    (item, index) => {
      let weightDisplay = "N/A";
      let qtyDisplay = "N/A";

      if (
        ["plastic", "non woven", "ld cord"].includes(
          item.category.toLowerCase()
        )
      )
        weightDisplay = `${item.weight.toFixed(4)} kg`;

      if (
        [
          "zipper",
          "fabric",
          "canvas",
          "cotton",
          "webbing",
          "inner dori",
        ].includes(item.category.toLowerCase())
      ) {
        qtyDisplay = `${Number(item.qty).toFixed(4)} m`;
      } else if (
        ["plastic", "non woven", "ld cord"].includes(
          item.category.toLowerCase()
        )
      ) {
        qtyDisplay = "N/A";
      } else if (
        [
          "runner",
          "slider",
          "bidding",
          "adjuster",
          "buckel",
          "dkadi",
          "accessories",
        ].includes(item.category.toLowerCase())
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
  //   qty: item.qty.toFixed(4),
  //   weight: item.weight.toFixed(4),
  // }));

  return consumptionTable;
};
