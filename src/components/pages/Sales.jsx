import React from "react";
import TableWithSearch from "../resources/TableWithSearch";

function Sales() {
  return (
    <div className="w-full px-3 content-center">
      <div className="-mt-[72px]  w-full text-2xl mx-3 text-neutral-100 flex font-semibold italic text-shadow">
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Reporte &nbsp;
        </h1>
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Ventas
        </h1>
      </div>
      <div className="my-20"></div>

      <div className="flex flex-col items-center">
        <div className="py-3">

          <div className="">
            <TableWithSearch />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
