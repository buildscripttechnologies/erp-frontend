// Registry mapping of path -> component used by TabContentHost for keep-alive tabs
import Dash from "../components/Dash";
import MasterUsers from "../components/master/MasterUsers";
import RmMaster from "../components/master/RmMaster";
import UomMaster from "../components/master/uom/UomMaster";
import SfgMaster from "../components/master/sfg/SfgMaster";
import LocationMaster from "../components/master/location/LocationMaster";
import FgMaster from "../components/master/fg/FgMaster";
import VendorMaster from "../components/master/vendor/VendorMaster";
import RoleMaster from "../components/master/Role/RoleMaster";
import CustomerMaster from "../components/master/customer/CustomerMaster";
import BOMMaster from "../components/master/bom/BomMaster";
import SampleMaster from "../components/master/sample/SampleMaster";
import PurchaseOrder from "../components/purchase/PurchaseOrder";
import POApproval from "../components/purchase/POApproval";
import StockRegister from "../components/stockRegister/StockRegister";
import MaterialInward from "../components/materialInward/MaterialInward";
import MaterialIssue from "../components/materialIssue/MaterialIssue";
import MaterialReceive from "../components/materialReceive/MaterialReceive";
import Cutting from "../components/jobWork/insideFactory/Cutting";
import Printing from "../components/jobWork/insideFactory/Printing";
import Pasting from "../components/jobWork/insideFactory/Pasting";
import Stitching from "../components/jobWork/insideFactory/Stitching";
import QualityCheck from "../components/jobWork/insideFactory/QualityCheck";
import OutsideFactory from "../components/jobWork/outsideFactory/OutsideFactory";
import CustomerOrder from "../components/customerOrder/CustomerOrder";
import COP from "../components/coPendency/COP";
import IndiaMartLeads from "../components/leads/indiamart/IndiaMartLeads";
import Settings from "../components/settings/Settings";
import ProductionList from "../components/productionList/ProductionList";
import MaterialConsumption from "../components/materialConsumption/MaterialConsumption";
import QuotationMaster from "../components/quotationMaster/QuotationMaster";

const registry = new Map([
  ["/dashboard", Dash],
  ["/leads", IndiaMartLeads],
  ["/stock-register", StockRegister],
  ["/quotation-master", QuotationMaster],
  ["/customer-order", CustomerOrder],
  ["/co-pendency", COP],
  ["/purchase-order", PurchaseOrder],
  ["/purchase-order-approval", POApproval],
  ["/material-inward", MaterialInward],
  ["/material-issue", MaterialIssue],
  ["/material-receive", MaterialReceive],
  ["/material-consumption", MaterialConsumption],
  ["/production-list", ProductionList],
  ["/inside-company/cutting", Cutting],
  ["/inside-company/printing", Printing],
  ["/inside-company/pasting", Pasting],
  ["/inside-company/stitching", Stitching],
  ["/inside-company/quality-check", QualityCheck],
  ["/outside-company", OutsideFactory],
  ["/master-users", MasterUsers],
  ["/uom-master", UomMaster],
  ["/role-master", RoleMaster],
  ["/rm-master", RmMaster],
  ["/location-master", LocationMaster],
  ["/sfg-master", SfgMaster],
  ["/fg-master", FgMaster],
  ["/sample-master", SampleMaster],
  ["/bom-master", BOMMaster],
  ["/vendor-master", VendorMaster],
  ["/customer-master", CustomerMaster],
  ["/settings", Settings],
]);

export function getComponentForPath(path) {
  // Normalize path without trailing slashes or query/hash
  const key = (path || "").split("?")[0].split("#")[0].replace(/\/$/, "");
  return registry.get(key) || null;
}
