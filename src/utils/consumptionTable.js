// import { fabric, plastic, slider, zipper } from "../data/dropdownData";

export const generateConsumptionTable = (productDetails = [], categoryData) => {
  const { fabric, slider, plastic, zipper } = categoryData;
  const mergedRawMaterials = {};
  // console.log("product details", productDetails);

  (productDetails || []).forEach((item) => {
    const sku = item.skuCode || "";
    const category = (item.category || "").toLowerCase();
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

    if (zipper.includes(category)) {
      const totalInches = width * qty;
      mergedRawMaterials[sku].qty += totalInches / 39.37; // meters
    } else if (fabric.includes(category)) {
      if (width && height && qty && panno) {
        // const perRowA = Math.floor(panno / width);
        // const rowsA = perRowA > 0 ? Math.ceil(qty / perRowA) : Infinity;
        // const totalInchesA = rowsA * height;

        // const perRowB = Math.floor(panno / height);
        // const rowsB = perRowB > 0 ? Math.ceil(qty / perRowB) : Infinity;
        // const totalInchesB = rowsB * width;

        // const bestInches = Math.min(totalInchesA, totalInchesB);
        // mergedRawMaterials[sku].qty += bestInches / 39.37;


        // const multiplier = Number(item.multiplier || 1);

        const areaSqInch = height * width * qty;

        // const fabricWidth = Number(item.fabricWidth || 58);

        const consumptionMeter = areaSqInch / panno / 39.37;

        mergedRawMaterials[sku].qty += consumptionMeter;
      }
    } else if (plastic.includes(category)) {
      mergedRawMaterials[sku].weight += grams / 1000;
      mergedRawMaterials[sku].qty += qty;
    } else if (slider.includes(category)) {
      mergedRawMaterials[sku].qty += qty;
    } else {
      mergedRawMaterials[sku].qty += qty;
    }
  });

  // categories that should NOT get 3% extra
  const excludedCategories = [...slider];

  // Apply +3% for all other categories
  Object.values(mergedRawMaterials).forEach((item) => {
    if (!excludedCategories.includes(item.category.toLowerCase())) {
      // console.log("before", item.qty, item.weight);

      item.weight = item.weight; // add 3%
      item.qty = item.qty; // add 3%
      // console.log("after", item.qty, item.weight);
    }
  });

  const consumptionTable = Object.values(mergedRawMaterials).map((item) => {
    let weightDisplay = "N/A";
    let qtyDisplay = "N/A";

    if (plastic.includes(item.category))
      weightDisplay = `${item.weight.toFixed(4)} kg`;

    if ([...fabric, ...zipper].includes(item.category)) {
      qtyDisplay = `${Number(item.qty).toFixed(4)} m`;
    } else if (plastic.includes(item.category)) {
      qtyDisplay = "N/A";
    } else if (slider.includes(item.category)) {
      qtyDisplay = item.qty;
    } else {
      qtyDisplay = item.qty.toFixed(4);
    }

    return {
      skuCode: item.skuCode,
      itemName: item.itemName,
      category: item.category,
      weight: weightDisplay,
      qty: qtyDisplay,
    };
  });

  return consumptionTable;
};
