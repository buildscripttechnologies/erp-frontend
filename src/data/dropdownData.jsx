import { useCategories } from "../context/CategoryContext";

export const cuttingType = [
  "Slitting Cutting",
  "Cutting",
  "Press Cutting",
  "Laser Cutting",
  "Table Cutting",
];
export const jobWorkType = ["Inside Company", "Outside Company"];
export const vendors = ["vendor 1", "vendor 2", "vendor 3"];

export const availableModules = [
  "Dashboard",
  "Leads",
  "Stock",
  "Quotation Master",
  "Customer Order",
  "CO Pendency",
  "Purchase Order",
  "PO Approval",
  "Material Inward",
  "Material Issue",
  "Material Receive",
  "Production List",
  "Cutting",
  "Printing",
  "Pasting",
  "Stitching",
  "Quality Check",
  "Outside Company",
  "Accessories Inward",
  "Accessories Issue",
  "Accessories Receive",
  "Accessories List",
  "User",
  "UOM",
  "Role",
  "RawMaterial",
  "Location",
  "SFG",
  "FG",
  "Sample",
  "BOM",
  "Vendor",
  "Customer",
  "Settings",
];

export const availableActions = ["read", "write", "update", "delete"];

export const DEFAULT_FABRIC = ["fabric", "canvas", "cotton", "foam"];
export const DEFAULT_SLIDER = [
  "runner",
  "slider",
  "bidding",
  "adjuster",
  "buckel",
  "dkadi",
  "accessories",
];
export const DEFAULT_PLASTIC = ["plastic", "non woven", "ld cord"];
export const DEFAULT_ZIPPER = ["zipper", "webbing", "inner dori", "handle"];

export const QUERY_TYPE_MAP = {
  W: "Direct Enquiries",
  B: "Buy-Leads",
  P: "PNS Calls",
  BIZ: "Catalog Views",
  WA: "WhatsApp Enquiries",
};

export const useCategoryArrays = () => {
  const { categories } = useCategories() || {}; // prevent crash if null

  const fabric =
    categories?.["H x W x Q"]?.map((el) => el.toLowerCase()) || DEFAULT_FABRIC;
  const slider =
    categories?.["Q"]?.map((el) => el.toLowerCase()) || DEFAULT_SLIDER;
  const plastic =
    categories?.["G x Q"]?.map((el) => el.toLowerCase()) || DEFAULT_PLASTIC;
  const zipper =
    categories?.["W x Q"]?.map((el) => el.toLowerCase()) || DEFAULT_ZIPPER;

  return { fabric, slider, plastic, zipper };
};
