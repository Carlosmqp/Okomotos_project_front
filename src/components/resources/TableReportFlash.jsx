import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config/apiConfig";

function TableReportFlash({ report, onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 4;

  // Configuración de columnas por tipo de reporte
  const reportConfig = {
    1: {
      // Últimas ventas
      endpoint: "invoices",
      columns: [
        { key: "id", label: "Código" },
        { key: "created_at", label: "Fecha" },
        {
          key: "payment_method",
          label: "Tipo Pago",
          accessor: (item) => item.payment_method?.name,
        },
        {
          key: "total",
          label: "Total",
          accessor: (item) => formatCurrency(item.total),
        },
        {
          key: "subtotal",
          label: "Sub Total",
          accessor: (item) => formatCurrency(item.subtotal),
        },
        {
          key: "discount",
          label: "Descuento",
          accessor: (item) => formatCurrency(item.discount),
        },
      ],
      transformData: (data) =>
        data.map((item) => ({
          ...item,
          created_at: new Date(item.created_at).toLocaleDateString(),
        })),
    },
    2: {
      // Inventario muestras
      endpoint: "inventory_samples",
      columns: [
        { key: "code", label: "Código" },
        { key: "item", label: "Item" },
        {
          key: "category",
          label: "Categoría",
          accessor: (item) => item.category?.type,
        },
        {
          key: "stock",
          label: "Stock",
          accessor: (item) => formatNumber(item.stock),
        },
        {
          key: "employee",
          label: "Empleado",
          accessor: (item) =>
            item.employee?.first_name + " " + item.employee?.last_name,
        },
      ],
    },
    3: {
      // Stock inventario
      endpoint: "inventory",
      columns: [
        { key: "code", label: "Código" },
        { key: "created_at", label: "Fecha" },
        { key: "item", label: "Item" },
        {
          key: "category",
          label: "Categoría",
          accessor: (item) => item.category?.type,
        },
        {
          key: "stock",
          label: "Stock",
          accessor: (item) => formatNumber(item.stock),
        },
        {
          key: "traveler_price",
          label: "Precio Viajero",
          accessor: (item) => formatCurrency(item.traveler_price),
        },
        {
          key: "city_price",
          label: "Precio Ciudad",
          accessor: (item) => formatCurrency(item.city_price),
        },
        {
          key: "wholesale_price",
          label: "Precio Por Mayor",
          accessor: (item) => formatCurrency(item.wholesale_price),
        },
      ],
      transformData: (data) =>
        data.map((item) => ({
          ...item,
          created_at: new Date(item.created_at).toLocaleDateString(),
        })),
    },
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const config = reportConfig[report];

    if (!token || !config) {
      console.error("No token or invalid report type found");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${config.endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        let processedData = responseData.data || [];

        if (config.transformData) {
          processedData = config.transformData(processedData);
        }

        setData(processedData);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        console.error(`Failed to fetch data: ${response.status}`);
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

  useEffect(() => {
    fetchData();
  }, [report]);

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatNumber = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const config = reportConfig[report] || { columns: [] };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="table-auto w-full border-collapse rounded-md overflow-hidden shadow-md">
            <thead className="text-black">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} className="px-5 py-2 text-center">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                >
                  {config.columns.map((column) => {
                    const value = column.accessor
                      ? column.accessor(row)
                      : row[column.key];
                    return (
                      <td
                        key={`${index}-${column.key}`}
                        className="py-2 text-center"
                      >
                        {value || "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TableReportFlash;
