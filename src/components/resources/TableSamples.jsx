import React, { useState, useEffect } from "react";
import Pagination from "./Pagination";
import API_BASE_URL from "../../config/apiConfig";

function TableSamples({ onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const fetchSamples = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/inventory_samples?search=${searchTerm}&page=${currentPage}&per_page=${perPage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSamples(data.data);
          setTotalPages(data.last_page);
        } else if (
          !response.ok &&
          response.redirected &&
          response.url.includes("login_failed")
        ) {
          onLogout();
        } else {
          console.error(`Failed to fetch samples: ${response.status}`);
          try {
            const errorData = await response.json();
            console.error("Error details:", errorData);
          } catch (jsonError) {
            console.error("Response is not JSON:", jsonError);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSamples();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, perPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "decimal",
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
          className="w-full max-w-lg h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="w-full overflow-x-auto">
        <table className="table-auto w-[1610px] min-w-[600px]  border-collapse rounded-md overflow-hidden shadow-md">
          <thead className="bg-lime-700/15 text-lime-900">
            <tr>
              <th className="px-5 py-2 text-center">Código</th>
              <th className="px-16 py-2 text-center">Item</th>
              <th className="px-16 py-2 text-center">Categoria</th>
              <th className="px-16 py-2 text-center">Stock</th>
              <th className="px-10 py-2 text-center">Empleado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-2 text-center">
                  Cargando...
                </td>
              </tr>
            ) : samples.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  No hay Muestras disponibles.
                </td>
              </tr>
            ) : (
              samples.map((row) => (
                <tr
                  key={row.id}
                  className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                >
                  <td className="py-2 text-center">{row.code}</td>
                  <td className="py-2 text-center">{row.item}</td>
                  <td className="py-2 text-center">
                    {row.category.type ?? "Sin nombre"}
                  </td>
                  <td className="py-2 text-center">
                    {formatNumber(row.stock)}
                  </td>
                  <td className="py-2 text-center">
                    {row.employee
                      ? `${row.employee.first_name} ${row.employee.last_name}`
                      : "Sin asignar"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginator */}
      {samples.length > 0 ? (
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

export default TableSamples;
