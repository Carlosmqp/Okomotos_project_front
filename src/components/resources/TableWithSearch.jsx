import React, { useState, useEffect, useRef } from "react";
import Pagination from "./Pagination";
import moment from "moment";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API_BASE_URL from "../../config/apiConfig";

function TableWithSearch({ onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [inventaries, setInventaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [currentInvoiceDetails, setCurrentInvoiceDetails] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [perPage] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/invoices?search=${searchTerm}&page=${currentPage}&per_page=${perPage}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          !response.ok &&
          response.redirected &&
          response.url.includes("login_failed")
        ) {
          onLogout();
          return;
        } else if (!response.ok) {
          console.error(`Failed to fetch invoices: ${response.status}`);
          const errorData = await response.json();
          console.error("Error details:", errorData);
          return;
        }

        const data = await response.json();
        setInvoices(data.data);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInventaries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
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
          throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error("La API devolvió un formato inesperado");
        }

        const inventoriesMap = {};
        data.data.forEach((inventory) => {
          inventoriesMap[inventory.id] = inventory.item;
        });

        setInventaries(inventoriesMap);
      } catch (error) {
        console.error("Error al obtener inventarios:", error);
        setInventaries({});
      }
    };

    fetchInventaries();

    fetchInvoices(currentPage);
  }, [searchTerm, currentPage, perPage]);

  const pdfRef = useRef();

  const handleGeneratePdf = async (invoiceId) => {
    try {
      const token = localStorage.getItem("token");

      const invoiceResponse = await fetch(
        `${API_BASE_URL}/invoices/${invoiceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        !invoiceResponse.ok &&
        invoiceResponse.redirected &&
        invoiceResponse.url.includes("login_failed")
      ) {
        onLogout();
        return;
      } else if (!invoiceResponse.ok) {
        throw new Error("Error al obtener los datos de la factura");
      }

      const invoiceData = await invoiceResponse.json();

      // console.log(invoiceData);
      const detailsResponse = await fetch(
        `${API_BASE_URL}/invoice_details?invoice_id=${invoiceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        !detailsResponse.ok &&
        detailsResponse.redirected &&
        detailsResponse.url.includes("login_failed")
      ) {
        onLogout();
        return;
      } else if (!detailsResponse.ok) {
        throw new Error("Error al obtener los detalles de la factura");
      }

      const invoiceDetails = await detailsResponse.json();

      const clientResponse = await fetch(
        `${API_BASE_URL}/clients/${invoiceData.client_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        !clientResponse.ok &&
        clientResponse.redirected &&
        clientResponse.url.includes("login_failed")
      ) {
        onLogout();
        return;
      } else if (!clientResponse.ok) {
        throw new Error("Error al obtener los datos del cliente");
      }

      const clientData = await clientResponse.json();

      const row = {
        ...clientData,
        city: null,
      };

      setClientData(row);
      setCityData({
        id: clientData.city.id,
        name: clientData.city.name,
      });

      setCurrentInvoice(invoiceData);
      setCurrentInvoiceDetails(invoiceDetails || []);

      setTimeout(() => {
        const input = pdfRef.current;
        html2canvas(input).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
          pdf.save(`factura_${invoiceId}.pdf`);
        });
      }, 100);
    } catch (error) {
      toast.error("Error al generar el PDF:", error);
    }
  };

  const handleCheckboxChange = async (invoiceId, currentEstado) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const newStatus = !currentEstado;

    try {
      const response = await fetch(
        `${API_BASE_URL}/invoices/update_status/${invoiceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      await response.json();

      // console.log(response);
      if (response.ok) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice.id === invoiceId
              ? { ...invoice, status: newStatus }
              : invoice
          )
        );

        if (newStatus) {
          toast.info("Factura cancelada");
        } else {
          toast.success("Factura habilitada");
        }
      } else {
        toast.error("Error updating invoice:", await response.json());
      }
    } catch (error) {
      toast.error("Request failed:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
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

      <table className="table-auto w-[1610px] min-w-[600px]  border-collapse rounded-md overflow-hidden shadow-md">
        <thead className="bg-lime-700/15 text-lime-900">
          <tr>
            <th className="px-5 py-2 text-center">Código</th>
            <th className="px-16 py-2 text-center">Fecha</th>
            <th className="px-16 py-2 text-center">Tipo Pago</th>
            <th className="px-16 py-2 text-center">Total</th>
            <th className="px-10 py-2 text-center">Sub-total</th>
            <th className="px-10 py-2 text-center">Descuento</th>
            <th className="px-16 py-2 text-center">PDF</th>
            <th className="px-10 py-2 text-center">Estado</th>
            <th className="px-10 py-2 text-center">
              <img
                src="/images/icons/cancel.png"
                alt="Editar"
                className="inline h-9 w-9"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="py-2 text-center">
                Cargando...
              </td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-4 text-center text-gray-500">
                No hay Facturas disponibles.
              </td>
            </tr>
          ) : (
            invoices.map((row) => (
              <tr
                key={row.id}
                className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
              >
                <td className="py-2 text-center">{"FAC" + row.id}</td>
                <td className="py-2 text-center">
                  {moment(row.created_at).format("DD/MM/YYYY HH:mm:ss")}
                </td>
                <td className="py-2 text-center">{row.payment_method.name}</td>
                <td className="py-2 text-center">
                  {formatCurrency(row.total)}
                </td>
                <td className="py-2 text-center">
                  {formatCurrency(row.subtotal)}
                </td>
                <td className="py-2 text-center">
                  {formatCurrency(row.discount)}
                </td>
                <td className="py-2 text-center">
                  <button>
                    <img
                      src="/images/icons/pdf.png"
                      alt="PDF"
                      className="inline h-7"
                      onClick={() => handleGeneratePdf(row.id)}
                    />
                  </button>
                </td>
                <td className="py-2 text-center">
                  {row.status ? "Cancelada" : "Generada"}
                </td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    className="w-full max-w-lg h-8 px-4 rounded-md border-2 border-lime-800 outline-none"
                    checked={row.status}
                    onChange={() => handleCheckboxChange(row.id, row.status)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginator */}
      {invoices.length > 0 ? (
        <div className="flex justify-end w-full">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      ) : null}

      <div
        ref={pdfRef}
        style={{
          padding: 20,
          background: "white",
          position: "absolute",
          left: "-9999px",
        }}
      >
        <div className="flex justify-between mb-5">
          <div>
            <img src="/images/logo.png" className="h-16" alt="" />
          </div>
          <div className="text-5xl text-lime-800/50">
            <h1>Factura #{currentInvoice?.id || "N/A"}</h1>
          </div>
        </div>
        <div className="mb-10">
          <div>
            <h1>CARRERA 6 NORTE # 51N - 72 OLAYA HERRERA</h1>
          </div>
          <div>
            <h1>TELEFONO: (+57) 3146444124 </h1>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-start">
            <span className="">
              CLIENTE:{" "}
              {clientData
                ? `${clientData.first_name} ${clientData.last_name}`
                : "Cargando..."}
            </span>
            <span className="mx-40">
              NTI: {clientData?.identification || "Cargando..."}
            </span>
            <span className="">
              TELEFONO: {clientData?.phone || "Cargando..."}
            </span>
          </div>

          <div className="flex justify-start">
            <span className="">
              FECHA:{" "}
              {currentInvoice
                ? new Date(currentInvoice.created_at).toLocaleDateString()
                : "N/A"}
            </span>
            <span className="mx-44">
              CIUDAD: {cityData?.name || "Cargando..."}
            </span>
          </div>

          <div className="flex justify-start">
            <span className="">
              DIRECCIÓN: {clientData?.address || "Cargando..."}
            </span>
            <span className="mx-36">
              PAGO: {currentInvoice?.payment_method.name || ""}
            </span>
          </div>
        </div>

        <table className="table-auto w-full min-w-[600px] border-collapse overflow-hidden shadow-md">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th colSpan={5}>REMISION</th>
            </tr>
            <tr>
              <th className="px-5 py-3 text-center">Cantidad</th>
              <th className="px-16 py-3 text-center">Codigo</th>
              <th className="px-16 py-3 text-center">Descripcion</th>
              <th className="px-16 py-3 text-center">Precio Unitario</th>
              <th className="px-10 py-3 text-center">Valor</th>
            </tr>
          </thead>
          <tbody>
            {currentInvoiceDetails.length > 0 ? (
              currentInvoiceDetails.map((detail) => (
                <tr key={detail.id} className="border-b-2">
                  <td className="py-2 text-center">{detail.quantity}</td>
                  <td className="py-2 text-center">{detail.invoice_id}</td>
                  <td className="py-2 text-center">{detail.product.item}</td>
                  <td className="py-2 text-center">
                    {formatCurrency(detail.unit_price)}
                  </td>
                  <td className="py-2 text-center">
                    {formatCurrency(detail.total)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-2">
                  No hay detalles disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-5">
          <div>
            <p>SUBTOTAL: {formatCurrency(currentInvoice?.subtotal || 0)}</p>
            <p>DESCUENTO: {formatCurrency(currentInvoice?.discount || 0)}</p>
            <p>TOTAL: {formatCurrency(currentInvoice?.total || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableWithSearch;
