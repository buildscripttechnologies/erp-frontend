// OrderCard.jsx
export function OrderCard({ name, numbers, value }) {
  return (
    <>
      <div className="relative bg-white p-3 rounded-lg drop-shadow-sm shadow-md flex w-[100%] flex-col mx-auto items-center justify-between hover:scale-105 hover:drop-shadow-xl transition-transform duration-300 ease-in-out">
        <span className="relative w-full text-[#d8b76a] mb-4 text-lg lg:text-xl text-left font-semibold">
          {name}
        </span>
        <div className="relative mb-1 bg-white w-full flex border-b-2 border-[#d8b76a] mx-auto items-center justify-between">
          <span className="text-[#292927] text-sm font-semibold lg:text-base">
            Numbers
          </span>
          <span className="text-[#292927] text-sm font-semibold lg:text-base">
            Value
          </span>
        </div>
        <div className="relative bg-white pt-2 flex w-full  mx-auto items-center justify-between">
          <span className="text-black text-base font-semibold lg:text-lg">
            {numbers}
          </span>
          <span className="text-black text-base font-semibold lg:text-lg">
            {value}
          </span>
        </div>
      </div>
    </>
  );
}
