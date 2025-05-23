import React from "react";
import TableReportFlash from "../resources/TableReportFlash";
import SailGraphic from "../resources/SailGraphics";

function Home() {
  return (
    <>
      <div className="">
        <div className="flex px-5 pt-5 mb-10">
          <div className="h-80 w-full rounded-t-lg shadow-lg">
            <div className="bg-white h-full rounded-t-lg border-lime-700/55">
              <div className="w-full flex items-center h-16 rounded-t-md border-b-2 border-lime-700/55 text-lime-800/85 text-2xl font-medium bg-lime-700/15">
                <h2 className="ml-4">Ultimas Ventas</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <TableReportFlash report={1} />
              </div>
            </div>
          </div>

          <div className="flex h-80 w-full ml-10">
            <div className="bg-white h-full w-full mr-5 rounded-t-lg border-lime-700/55 shadow-lg">
              <div className="w-full flex flex-col h-full">
                <div className="flex items-center h-16 rounded-t-md border-b-2 border-lime-700/55 text-lime-800/85 text-2xl font-medium bg-lime-700/15">
                  <h2 className="ml-4">Ventas Realizadas Año Vigente</h2>
                </div>
                <div className="flex-1 p-4">
                  <SailGraphic report={1} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex px-5 pt-5 mb-10">
          <div className="h-80 w-full rounded-t-lg shadow-lg">
            <div className="bg-white h-full rounded-t-lg border-lime-700/55">
              <div className="w-full flex items-center h-16 rounded-t-md border-b-2 border-lime-700/55 text-lime-800/85 text-2xl font-medium bg-lime-700/15">
                <h2 className="ml-4">Inventario Muestras</h2>
              </div>
              <div className="flex-1  overflow-y-auto">
                <TableReportFlash report={2} />
              </div>
            </div>
          </div>

          <div className="flex h-80 w-full ml-10">
            <div className="bg-white h-full w-full mr-5 rounded-t-lg border-lime-700/55 shadow-lg">
              <div className="w-full flex flex-col h-full">
                <div className="flex items-center h-16 rounded-t-md border-b-2 border-lime-700/55 text-lime-800/85 text-2xl font-medium bg-lime-700/15">
                  <h2 className="ml-4">Total Ventas Realizadas</h2>
                </div>
                <div className="flex-1 p-4">
                  <SailGraphic report={2} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex px-5 pt-5 mb-10">
          <div className="flex h-80 w-full">
            <div className="bg-white h-full w-full mr-5 rounded-t-lg border-lime-700/55 shadow-lg">
              <div className="w-full flex flex-col h-full">
                <div className="flex items-center h-16 rounded-t-md border-b-2 border-lime-700/55 text-lime-800/85 text-2xl font-medium bg-lime-700/15">
                  <h2 className="ml-4">Productos de Inventario Más Recientes</h2>
                </div>
                <div className="flex-1 p-4">
                  <SailGraphic report={3} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
