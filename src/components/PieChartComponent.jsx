// PieChartComponent.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function OrderPieChart({ data }) {
  // const data = [
  //   { name: "Single PO", value: 10000 },
  //   { name: "Scattered PO", value: 5000 },
  //   { name: "RC PO", value: 2000 },
  // ];
  const colors = ["#d8b76a", "#86efac", "#93c5fd"]; // gold, green, blue
  return (
    <div className="relative bg-white shadow-md drop-shadow-sm rounded-lg p-5 mt-4">
      <div>
        <h3 className="font-semibold text-primary text-lg mb-2">
          Order Values
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%">
              {data.map((entry, index) => (
                <Cell
                  key={`slice-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Custom tile-style legend */}
      <div className="flex justify-center mt-4 flex-wrap gap-4">
        {data.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: colors[index] }}
            ></div>
            <span>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
