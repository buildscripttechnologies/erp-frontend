// OrderCard.jsx
export function OrderCard({ name, numbers, value }) {
  return (
    <>
      <div className="relative bg-white p-4 rounded-lg drop-shadow-sm shadow-md flex w-[100%] flex-col mx-auto items-center justify-between hover:scale-105 hover:drop-shadow-xl transition-transform duration-300 ease-in-out">
        <span className="relative w-full text-[#d8b76a] mb-6 text-xl lg:text-2xl text-left font-semibold">
          {name}
        </span>
        <div className="relative mb-2 bg-white w-full flex border-b-2 border-[#d8b76a] mx-auto items-center justify-between">
          <span className="text-[#292927] font-semibold lg:text-xl">Numbers</span>
          <span className="text-[#292927] font-semibold lg:text-xl">Value</span>
        </div>
        <div className="relative bg-white pt-4 flex w-full  mx-auto items-center justify-between">
          <span className="text-black text-xl font-semibold lg:text-xl">{numbers}</span>
          <span className="text-black text-xl font-semibold lg:text-xl">{value}</span>
        </div>
      </div>
    </>
  );
}
