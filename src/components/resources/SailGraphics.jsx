import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import API_BASE_URL from "../../config/apiConfig";

function SailGraphic({ report, onLogout = () => {} }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnualSales = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/invoices/annual`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else if (response.status === 401) {
        onLogout();
      } else {
        console.error("Error fetching annual sales data");
        setChartData(monthlySampleData);
      }
    } catch (error) {
      console.error("Error:", error);
      setChartData(monthlySampleData);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlySales = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/invoices/yearly`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ordenar los datos por año y limitar a los últimos 5 años
        const sortedData = data
          .sort((a, b) => a.year - b.year)
          .slice(-5)
          .map((item) => ({
            ...item,
            year: item.year.toString(), // Convertir año a string para el eje X
          }));
        setChartData(sortedData);
      } else if (response.status === 401) {
        onLogout();
      } else {
        console.error("Error fetching yearly sales data");
        setChartData(yearlySampleData);
      }
    } catch (error) {
      console.error("Error:", error);
      setChartData(yearlySampleData);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/inventory/stock_Inventario`,
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
        const processedData = data.data
          .map((item) => ({
            name: item.item,
            stock: item.stock,
            code: item.code,
          }))
          .sort((a, b) => b.id - a.id)
          .slice(0, 10);

        console.log(processedData);

        setChartData(processedData);
      } else if (response.status === 401) {
        onLogout();
      } else {
        console.error("Error fetching inventory data");
        setChartData(inventorySampleData);
      }
    } catch (error) {
      console.error("Error:", error);
      setChartData(inventorySampleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report === 1) {
      fetchAnnualSales();
    } else if (report === 2) {
      fetchYearlySales();
    } else if (report === 3) {
      fetchInventoryData();
    }
  }, [report]);

  const monthlySampleData = [
    { month: "Ene", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 2000 },
    { month: "Abr", sales: 2780 },
    { month: "May", sales: 1890 },
    { month: "Jun", sales: 2390 },
    { month: "Jul", sales: 3490 },
    { month: "Ago", sales: 4000 },
    { month: "Sep", sales: 5000 },
    { month: "Oct", sales: 6000 },
    { month: "Nov", sales: 7000 },
    { month: "Dic", sales: 8000 },
  ];

  const yearlySampleData = [
    { year: "2019", sales: 15000 },
    { year: "2020", sales: 25000 },
    { year: "2021", sales: 35000 },
    { year: "2022", sales: 45000 },
    { year: "2023", sales: 55000 },
  ];

  const inventorySampleData = [
    { name: "Producto 1", stock: 150, code: "P001" },
    { name: "Producto 2", stock: 120, code: "P002" },
    { name: "Producto 3", stock: 90, code: "P003" },
    { name: "Producto 4", stock: 85, code: "P004" },
    { name: "Producto 5", stock: 70, code: "P005" },
    { name: "Producto 6", stock: 65, code: "P006" },
    { name: "Producto 7", stock: 50, code: "P007" },
    { name: "Producto 8", stock: 45, code: "P008" },
    { name: "Producto 9", stock: 30, code: "P009" },
    { name: "Producto 10", stock: 25, code: "P010" },
  ];

  let dataKey, barName, barDataKey;

  if (report === 1) {
    dataKey = "month";
    barName = "Ventas Mensuales ($)";
    barDataKey = "sales";
  } else if (report === 2) {
    dataKey = "year";
    barName = "Ventas Anuales ($)";
    barDataKey = "sales";
  } else {
    dataKey = "name";
    barName = "Stock Actual";
    barDataKey = "stock";
  }

  const renderInventoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border rounded shadow">
          <p className="font-bold">{label}</p>
          <p className="text-lime-600/80">Código: {payload[0].payload.code}</p>
          <p className="text-lime-600/80">Stock: {payload[0].value} unidades</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full p-4">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          Cargando gráfico...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={
              chartData.length > 0
                ? chartData
                : report === 1
                ? monthlySampleData
                : report === 2
                ? yearlySampleData
                : inventorySampleData
            }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: report === 3 ? 30 : 5,
            }}
            layout={"horizontal"}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {report === 3 ? (
              <>
                <YAxis type="number" tick={{ fontSize: 12 }} />
                <XAxis
                  type="category"
                  dataKey={dataKey}
                  tick={{ fontSize: 12 }}
                />
              </>
            ) : (
              <>
                <XAxis dataKey={dataKey} />
                <YAxis />
              </>
            )}
            <Tooltip content={report === 3 ? renderInventoryTooltip : null} />
            <Legend />
            <Bar
              dataKey={barDataKey}
              name={barName}
              fill={report === 3 ? "#70b64e" : "#70b64e"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SailGraphic;
