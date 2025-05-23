import React from "react";
import { useState } from "react";
import TableReportGeneral from "../resources/TableReportGeneral";

function Reports() {
  const [selectedReport, setSelectedReport] = useState("");

  return (
    <div className="w-full px-3 content-center">
      <div className="-mt-[72px]  w-full text-2xl mx-3 text-neutral-100 flex font-semibold italic text-shadow">
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Reportes &nbsp;
        </h1>
      </div>
      <div className="my-20"></div>

      <div className="flex flex-col items-center">
        <div className="py-3">
          <div className="flex justify-start items-start -mb-10 ml-[830px]">
            <select
              name="reportes"
              id=""
              className="w-72 h-10 rounded-md px-3 outline-none text-lime-800 border-2 border-lime-800 relative z-50"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="">SELECCIONAR REPORTE</option>
              <option value="1">Reporte General</option>
              <option value="2">Reporte de Salidas</option>
              <option value="3">Reporte de Entradas</option>
              <option value="4">Reporte de Muestras</option>
            </select>
          </div>

          <div className="">
            <TableReportGeneral selectedReport={selectedReport} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
