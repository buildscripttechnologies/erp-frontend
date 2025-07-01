import React from "react";

export default function RoleSkeleton({ count = 5 }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-20 bg-[#d8b76a]/40 rounded animate-pulse"
        ></div>
      ))}
    </div>
  );
}
