// DashboardCard.jsx
export function DashboardCard({ title, value }) {
  return (
    <div className="bg-white py-2 px-4 rounded-lg drop-shadow-sm shadow-md flex w-[100%]  mx-auto items-center justify-between hover:scale-105 hover:drop-shadow-xl transition-transform duration-300 ease-in-out">
      <span className="text-[#d8b76a] text-lg font-semibold">{title}</span>
      <span className="text-lg font-semibold ">{value}</span>
    </div>
  );
}

// Usage in Dashboard.jsx (Master metrics)
