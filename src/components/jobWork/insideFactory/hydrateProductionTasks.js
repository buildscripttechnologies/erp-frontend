import axios from "../../../utils/axios";

export const hydrateProductionTasks = async (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const hydrated = await Promise.all(
    rows.map(async (mi) => {
      try {
        const res = await axios.get(`/production/by-mi/${mi._id}`);
        return {
          ...mi,
          productionTasks: res.data?.data || mi.productionTasks || [],
        };
      } catch {
        return {
          ...mi,
          productionTasks: mi.productionTasks || [],
        };
      }
    })
  );

  return hydrated;
};
