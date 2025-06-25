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
      }
    } catch (error) {
      console.error("Error:", error);
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
        const sortedData = data
          .sort((a, b) => a.year - b.year)
          .slice(-5)
          .map((item) => ({
            ...item,
            year: item.year.toString(),
          }));
        setChartData(sortedData);
      } else if (response.status === 401) {
        onLogout();
      } else {
        console.error("Error fetching yearly sales data");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/inventory/inventary_stock`,
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
      }
    } catch (error) {
      console.error("Error:", error);
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
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          No hay información disponible.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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
              fill="#70b64e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SailGraphic;
