import React, { useState, useEffect } from "react";
import Pagination from "./Pagination";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API_BASE_URL from "../../config/apiConfig";

function TableReportGeneral({ selectedReport, onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm2, setSearchTerm2] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [inventories, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const fetchMovements = async () => {
      try {
        let url = "";
        if (selectedReport === "1") {
          url += `${API_BASE_URL}/inventory/reporte_inventario?search=${searchTerm2}&page=${currentPage}&per_page=${perPage}`;
        } else if (selectedReport === "2") {
          url += `${API_BASE_URL}/movements?search=${searchTerm2}&page=${currentPage}&per_page=${perPage}`;
          url += "&movement_type=Salida";
        } else if (selectedReport === "3") {
          url += `${API_BASE_URL}/movements?search=${searchTerm2}&page=${currentPage}&per_page=${perPage}`;
          url += "&movement_type=Entrada";
        } else if (selectedReport === "4") {
          url += `${API_BASE_URL}/movements?search=${searchTerm2}&page=${currentPage}&per_page=${perPage}`;
          url += "&movement_type=Muestra";
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          // console.log(data.data);

          setInventory(data.data);
          setTotalPages(data.last_page);
        } else if (
          !response.ok &&
          response.redirected &&
          response.url.includes("login_failed")
        ) {
          onLogout();
        } else {
          console.error(`Failed to fetch movements: ${response.status}`);
          const errorData = await response.json();
          console.error("Error details:", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchMovements();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm2, currentPage, perPage, selectedReport]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const exportToExcel = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      let url = "";
      let report = "";

      if (selectedReport === "1") {
        url += `${API_BASE_URL}/inventory/reporte_inventario?search=${searchTerm2}&per_page=10000`;
        report = "Reporte_General";
      } else if (selectedReport === "2") {
        url = `${API_BASE_URL}/movements?search=${searchTerm2}&per_page=10000&movement_type=Salida`;
        report = "Reporte_Salidas";
      } else if (selectedReport === "3") {
        url = `${API_BASE_URL}/movements?search=${searchTerm2}&per_page=10000&movement_type=Entrada`;
        report = "Reporte_Entradas";
      } else if (selectedReport === "4") {
        url = `${API_BASE_URL}/movements?search=${searchTerm2}&per_page=10000&movement_type=Muestra`;
        report = "Reporte_Muestras";
      } else {
        toast.error("Seleccione un reporte");
        return;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
        return;
      } else if (!response.ok) {
        console.error(
          `Error al obtener los datos completos: ${response.status}`
        );
        return;
      }

      const data = await response.json();
      const allData = data.data;

      console.log(allData);

      if (!allData || allData.length === 0) {
        console.error("No hay datos para exportar");
        return;
      }

      if (selectedReport === "1") {
        const worksheet = XLSX.utils.json_to_sheet(
          allData.map((row) => ({
            Código: row?.code || "N/A",
            Fecha: row.created_at
              ? dayjs(row.created_at).format("DD/MM/YYYY HH:mm:ss")
              : "N/A",
            Item: row?.item || "N/A",
            Muestras: row?.muestras || "N/A",
            Stock: row?.stock || "N/A",
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const excelBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(excelBlob, "reporte.xlsx");
        toast.success("¡Excel Generado!");
      } else {
        const worksheet = XLSX.utils.json_to_sheet(
          allData.map((row) => ({
            Código: row.product?.id || "N/A",
            Fecha: row.updated_at
              ? dayjs(row.updated_at).format("DD/MM/YYYY HH:mm:ss")
              : "N/A",
            Item: row.product?.item || "N/A",
            Stock: row.product?.stock || "N/A",
            Movimiento: row.movement_type || "N/A",
            Cantidad: row.quantity || "N/A",
            Descripción: row.description || "N/A",
          }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const excelBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(excelBlob, `${report}.xlsx`);
        toast.success("¡Excel Generado!");
      }
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
    }
  };

  const exportToPDF = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      let url = "";
      let report = "";
      let tittle = "";

      if (selectedReport === "1") {
        url += `${API_BASE_URL}/inventory/reporte_inventario?search=${searchTerm2}&per_page=10000`;
        report = "Reporte_General";
        tittle = "Reporte General";
      } else if (selectedReport === "2") {
        url = `${API_BASE_URL}/movements?search=${searchTerm2}&per_page=10000&movement_type=Salida`;
        report = "Reporte_Salidas";
        tittle = "Reporte Salidas";
      } else if (selectedReport === "3") {
        url = `${API_BASE_URL}/movements?search=${searchTerm2}&per_page=10000&movement_type=Entrada`;
        report = "Reporte_Entradas";
        tittle = "Reporte Entradas";
      } else if (selectedReport === "4") {
        url = `${API_BASE_URL}/movements?search=${searchTerm2}&per_page=10000&movement_type=Muestra`;
        report = "Reporte_Muestras";
        tittle = "Reporte Muestras";
      } else {
        toast.error("Seleccione un reporte");
        return;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
        return;
      } else if (!response.ok) {
        console.error(
          `Error al obtener los datos completos: ${response.status}`
        );
        return;
      }

      const data = await response.json();
      const allData = data.data;

      if (!allData || allData.length === 0) {
        console.error("No hay datos para exportar");
        return;
      }

      const doc = new jsPDF();

      doc.setTextColor(44, 68, 27);
      doc.text(`${tittle}`, 14, 10);

      if (selectedReport === "1") {
        autoTable(doc, {
          head: [["Código", "Fecha", "Item", "Muestra", "Stock"]],
          body: allData.map((row) => [
            row?.code || "N/A",
            row.created_at
              ? dayjs(row.created_at).format("DD/MM/YYYY HH:mm:ss")
              : "N/A",
            row?.item || "N/A",
            row?.muestras || "N/A",
            row?.stock || "N/A",
          ]),
          bodyStyles: {
            textColor: [56, 82, 37],
            halign: "center",
          },
          headStyles: {
            fillColor: [210, 230, 196],
            textColor: [56, 82, 37],
            fontStyle: "bold",
            halign: "center",
            valign: "middle",
          },
        });
      } else {
        autoTable(doc, {
          head: [
            [
              "Código",
              "Fecha",
              "Item",
              "Stock",
              "Movimiento",
              "Cantidad",
              "Descripcion",
            ],
          ],
          body: allData.map((row) => [
            row.product?.id || "N/A",
            row.updated_at
              ? dayjs(row.updated_at).format("DD/MM/YYYY HH:mm:ss")
              : "N/A",
            row.product?.item || "N/A",
            row.product?.stock || "N/A",
            row.movement_type || "N/A",
            row.quantity || "N/A",
            row.description || "N/A",
          ]),
          bodyStyles: {
            textColor: [56, 82, 37],
            halign: "center",
          },
          headStyles: {
            fillColor: [210, 230, 196],
            textColor: [56, 82, 37],
            fontStyle: "bold",
            halign: "center",
          },
        });
      }

      doc.save(`${report}.pdf`);
      toast.success("¡PDF Generado!");
    } catch (error) {
      console.error("Error al exportar el PDF:", error);
    }
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
      {/* Search */}
      <div className="flex w-full mb-4 justify-between">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-[800px] h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
          value={searchTerm2}
          onChange={(e) => setSearchTerm2(e.target.value)}
        />

        <div className="space-x-4 ml-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-lime-800 text-white rounded hover:bg-lime-900"
          >
            Exportar a Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-lime-800 text-white rounded hover:bg-lime-900"
          >
            Exportar a PDF
          </button>
        </div>
      </div>

      {selectedReport === "1" ? (
        <table className="table-auto w-[1610px] min-w-full border-collapse rounded-md overflow-hidden shadow-md">
          <thead className="bg-lime-700/15 text-lime-900">
            <tr>
              <th className="px-5 py-2 text-center">Código</th>
              <th className="px-16 py-2 text-center">Fecha</th>
              <th className="px-16 py-2 text-center">Item</th>
              <th className="px-16 py-2 text-center">Muestras</th>
              <th className="px-16 py-2 text-center">Stock</th>
            </tr>
          </thead>
          {inventories.length > 0 ? (
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-2 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : (
                inventories.map((row) => (
                  <tr
                    key={row.id}
                    className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                  >
                    <td className="py-2 text-center">{row?.code || "N/A"}</td>
                    <td className="py-2 text-center">
                      {moment(row.updated_at).format("DD/MM/YYYY HH:mm:ss")}
                    </td>
                    <td className="py-2 text-center">
                      {row?.item || "Desconocido"}
                    </td>
                    <td className="py-2 text-center">{row?.muestras}</td>
                    <td className="py-2 text-center">
                      {formatNumber(row?.stock || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          ) : (
            <tbody>
              <tr className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55">
                <td colSpan={6} className="py-2 text-center">
                  No Hay Información
                </td>
              </tr>
            </tbody>
          )}
        </table>
      ) : selectedReport >= "2" ? (
        <table className="table-auto w-[1610px] min-w-full border-collapse rounded-md overflow-hidden shadow-md">
          <thead className="bg-lime-700/15 text-lime-900">
            <tr>
              <th className="px-5 py-2 text-center">Código</th>
              <th className="px-16 py-2 text-center">Fecha</th>
              <th className="px-16 py-2 text-center">Item</th>
              <th className="px-16 py-2 text-center">Movimiento</th>
              <th className="px-16 py-2 text-center">Cantidad</th>
              <th className="px-16 py-2 text-center">Descripcion</th>
            </tr>
          </thead>

          {inventories.length > 0 ? (
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-2 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : (
                inventories.map((row) => (
                  <tr
                    key={row.id}
                    className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                  >
                    <td className="py-2 text-center">
                      {row.product?.id || "N/A"}
                    </td>
                    <td className="py-2 text-center">
                      {moment(row.updated_at).format("DD/MM/YYYY HH:mm:ss")}
                    </td>
                    <td className="py-2 text-center">
                      {row.product?.item || "Desconocido"}
                    </td>
                    <td className="py-2 text-center">{row.movement_type}</td>
                    <td className="py-2 text-center">
                      {formatNumber(row?.quantity || 0)}
                    </td>
                    <td className="py-2 text-center">{row.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          ) : (
            <tbody>
              <tr className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55">
                <td colSpan={6} className="py-2 text-center">
                  No Hay Información
                </td>
              </tr>
            </tbody>
          )}
        </table>
      ) : (
        <table className="table-auto w-[1610px] min-w-full border-collapse rounded-md overflow-hidden shadow-md">
          <thead className="bg-lime-700/15 text-lime-900">
            <tr>
              <th className="px-5 py-2 text-center">Código</th>
              <th className="px-16 py-2 text-center">Fecha</th>
              <th className="px-16 py-2 text-center">Item</th>
              <th className="px-16 py-2 text-center">Muestras</th>
              <th className="px-16 py-2 text-center">Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55">
              <td
                colSpan={6}
                className="py-2 text-center text-lime-800/90 text-lg"
              >
                Por favor seleccione un tipo de reporte
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Table */}

      {/* Paginator */}
      {inventories.length > 0 ? (
        <div className="flex justify-end w-full">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      ) : null}
    </div>
  );
}

export default TableReportGeneral;
