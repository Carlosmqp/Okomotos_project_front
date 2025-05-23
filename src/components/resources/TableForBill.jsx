import React, { useState, useEffect, useRef } from "react";
import Pagination from "./Pagination";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  TERipple,
  TEModal,
  TEModalDialog,
  TEModalContent,
  TEModalHeader,
  TEModalBody,
  TEModalFooter,
} from "tw-elements-react";
import API_BASE_URL from "../../config/apiConfig";

function TableForBill({
  selectedTax,
  selectedClient,
  selectedPaymentType,
  selectedPaymentTypeName,
  onLogout = () => {},
}) {
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [inventories, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrices, setSelectedPrices] = useState({});
  const [selectedUnits, setSelectedUnits] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [checkedRows, setCheckedRows] = useState({});
  const [discount, setDiscount] = useState(0);
  const [clientData, setClientData] = useState(null);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(1);
  const [cityData, setCityData] = useState(null);

  const pdfRef = useRef();

  const handleGeneratePdf = () => {
    if (!selectedClient) {
      return;
    }

    if (!selectedPaymentType) {
      return;
    }

    const input = pdfRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("documento.pdf");
    });
  };

  const fetchInventary = async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/inventory?search=${searchTerm}&page=${currentPage}&per_page=${perPage}`,
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
        setInventory(data.data);
        setTotalPages(data.last_page);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        try {
          await response.json();
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
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const fetchInvoice = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/invoices/get_all_invoices`,
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

          let lastCode = 0;
          if (data.length > 0) {
            const lastElement = data[data.length - 1];
            lastCode = lastElement.id;
          }

          setNextInvoiceNumber(lastCode + 1);
        } else if (
          !response.ok &&
          response.redirected &&
          response.url.includes("login_failed")
        ) {
          onLogout();
        } else {
          try {
            await response.json();
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
    fetchInvoice();

    setTimeout(() => {
      fetchInventary(token);
    }, 500);

    if (!selectedClient) return;

    const fetchClientData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/clients/${selectedClient}`,
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

          const row = {
            ...data,
            city: null,
          };

          setClientData(row);
          setCityData({
            id: data.city.id,
            name: data.city.name,
          });
        } else if (
          !response.ok &&
          response.redirected &&
          response.url.includes("login_failed")
        ) {
          onLogout();
        } else {
          console.error(`Error al obtener cliente: ${response.status}`);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      }
    };

    fetchClientData();
  }, [selectedClient, searchTerm, currentPage, perPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePriceChange = (rowId, value) => {
    setSelectedPrices((prev) => ({
      ...prev,
      [rowId]: parseFloat(value) || 0,
    }));
    updateValue(rowId, selectedUnits[rowId] || 0, parseFloat(value) || 0);
  };

  const handleUnitChange = (rowId, value, stock) => {
    const units = parseInt(value, 10) || 0;

    if (units > stock) {
      toast.error("La cantidad supera el stock disponible");
      setSelectedUnits((prev) => ({
        ...prev,
        [rowId]: 0,
      }));
    } else {
      setSelectedUnits((prev) => ({
        ...prev,
        [rowId]: units,
      }));
      updateValue(rowId, units, selectedPrices[rowId] || 0);
    }
  };

  const handleCheckboxChange = (rowId) => {
    const isChecked = checkedRows[rowId] ?? false;
    const newCheckedState = !isChecked;

    if (!isChecked) {
      toast.success("¡Producto agregado!");
    } else {
      toast.info("Producto retirado");
    }

    setCheckedRows((prev) => ({
      ...prev,
      [rowId]: newCheckedState,
    }));
  };

  const updateValue = (rowId, units, price) => {
    const total = units * price;
    setSelectedValues((prev) => ({
      ...prev,
      [rowId]: total,
    }));
  };

  const subtotal = Object.keys(selectedValues).reduce((sum, rowId) => {
    return checkedRows[rowId] ? sum + selectedValues[rowId] : sum;
  }, 0);

  const total = subtotal + (subtotal * selectedTax) / 100;
  const finalTotal = total - discount;

  const invoiceGenerate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("No token found");
      return;
    }

    if (!selectedClient) {
      toast.error("Por favor, selecciona un cliente.");
      return;
    }

    if (!selectedPaymentType) {
      toast.error("Por favor, selecciona un tipo de pago.");
      return;
    }

    console.log(selectedPaymentType);

    const invoiceData = {
      client_id: selectedClient,
      payment_method_id: selectedPaymentType,
      total: finalTotal,
      subtotal: subtotal,
      discount: discount,
      status: false,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/invoices/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      // console.log(response);
      if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else if (!response.ok) {
        toast.error("Fallo al crear Factura, verificar");
        return;
      }

      const invoice = await response.json();
      console.log("Invoice created successfully:", invoice);
      const invoiceId = invoice.id;

      const checkedRowsData = inventories.filter((row) => checkedRows[row.id]);

      for (const row of checkedRowsData) {
        const quantitySold = selectedUnits[row.id] || 1;

        const invoiceDetailData = {
          invoice_id: invoiceId,
          product_id: row.id,
          quantity: quantitySold,
          unit_price: selectedPrices[row.id] || 0,
          total: selectedValues[row.id] || 0,
        };

        const movementsData = {
          movement_type: "Salida",
          product_id: row.id,
          quantity: quantitySold,
          description: "Salida por venta",
        };

        const responseInvoiceDetail = await fetch(
          `${API_BASE_URL}/invoice_details/create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(invoiceDetailData),
          }
        );

        if (
          !responseInvoiceDetail.ok &&
          responseInvoiceDetail.redirected &&
          responseInvoiceDetail.url.includes("login_failed")
        ) {
          onLogout();
        } else if (!responseInvoiceDetail.ok) {
          console.error(
            "Failed to create invoice detail",
            await responseInvoiceDetail.json()
          );
          toast.error("Fallo al insertar la factura");
          return;
        }

        console.log(
          "Invoice detail added:",
          await responseInvoiceDetail.json()
        );

        const responseMovements = await fetch(
          `${API_BASE_URL}/movements/create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(movementsData),
          }
        );
        if (
          !responseMovements.ok &&
          responseMovements.redirected &&
          responseMovements.url.includes("login_failed")
        ) {
          onLogout();
        } else if (!responseMovements.ok) {
          console.error(
            "Failed to create movement",
            await responseMovements.json()
          );
          toast.error("¡Ah ocrurrido un error con los movimientos!");
          return;
        }

        console.log(
          "Movement created successfully:",
          await responseMovements.json()
        );

        const updatedStock = row.stock - quantitySold;

        const responseStockUpdate = await fetch(
          `${API_BASE_URL}/inventory/update/${row.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ stock: updatedStock }),
          }
        );

        if (
          !responseStockUpdate.ok &&
          responseStockUpdate.redirected &&
          responseStockUpdate.url.includes("login_failed")
        ) {
          onLogout();
        } else if (!responseStockUpdate.ok) {
          toast.error("¡Ah ocrurrido un error al actualizar el stock!");
          return;
        }

        console.log(
          "Stock updated successfully:",
          await responseStockUpdate.json()
        );
      }
      fetchInventary(token);
      setSelectedUnits({});
      setSelectedPrices({});
      setSelectedValues({});
      setCheckedRows({});
      setDiscount("");

      toast.success("¡Factura generada con exito!");
    } catch (error) {
      toast.error(error);
    }
  };

  const isAnyChecked = Object.values(checkedRows).some(
    (isChecked) => isChecked
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatNumber = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const handleCloseModal = () => {
    setShowModalTopRight(false);
  };

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
              <th className="px-16 py-2 text-center">Categoría</th>
              <th className="px-10 py-2 text-center">Stock</th>
              <th className="px-16 py-2 text-center">Unidades</th>
              <th className="px-16 py-2 text-center">Tipo Precio</th>
              <th className="px-16 py-2 text-center">Precio Unitario</th>
              <th className="px-16 py-2 text-center">Valor</th>
              <th className="px-5 py-2 text-center">
                <img
                  src="/images/icons/checksquare.png"
                  alt="Check"
                  className="inline h-7"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-2 text-center">
                  Cargando...
                </td>
              </tr>
            ) : (
              inventories.map((row) => {
                const filteredInventories = inventories.filter(
                  (inventory) => inventory.id === row.id
                );

                return (
                  <tr
                    key={row.id}
                    className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                  >
                    <td className="py-2 text-center">{row.code}</td>
                    <td className="py-2 text-center">{row.item}</td>
                    <td className="py-2 text-center">{row.category.type}</td>
                    <td className="py-2 text-center">
                      {row.stock ? formatNumber(row.stock) : ""}
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="text"
                        placeholder="Digite Unidades"
                        className="w-full max-w-lg h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                        value={selectedUnits[row.id] || ""}
                        onChange={(e) =>
                          handleUnitChange(row.id, e.target.value, row.stock)
                        }
                      />
                    </td>
                    <td className="py-2 text-center">
                      <select
                        name=""
                        id=""
                        className="w-56 h-10 px-2 rounded-md border-2 border-lime-800 outline-none"
                        onChange={(e) =>
                          handlePriceChange(row.id, e.target.value)
                        }
                      >
                        <option value="">Seleccionar</option>
                        {filteredInventories.map((inventory) => (
                          <React.Fragment key={inventory.id}>
                            <option value={inventory.traveler_price}>
                              {"Viajero"}
                            </option>
                            <option value={inventory.city_price}>
                              {"Ciudad"}
                            </option>
                            <option value={inventory.wholesale_price}>
                              {"Por Mayor"}
                            </option>
                          </React.Fragment>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className="w-full max-w-lg h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                        value={
                          selectedPrices[row.id]
                            ? formatCurrency(selectedPrices[row.id])
                            : ""
                        }
                        disabled
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className="w-full max-w-lg h-10 px-4 mx-2 rounded-md border-2 border-lime-800 outline-none"
                        value={
                          selectedValues[row.id]
                            ? formatCurrency(selectedValues[row.id])
                            : ""
                        }
                        disabled
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="checkbox"
                        className="w-full max-w-lg h-8 px-4 rounded-md border-2 border-lime-800 outline-none"
                        checked={checkedRows[row.id] || false}
                        onChange={() => handleCheckboxChange(row.id)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

      <div className="flex w-full justify-end">
        <div>
          <label htmlFor="">Descuento</label>
          <input
            type="text"
            placeholder="Descuento"
            className="w-full max-w-lg h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </div>

        <div className="mx-3">
          <label htmlFor="">Sub Total</label>
          <input
            type="text"
            placeholder="Sub Total"
            className="w-full max-w-lg h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
            value={
              subtotal.toFixed(2) ? formatCurrency(subtotal.toFixed(2)) : ""
            }
            disabled
          />
        </div>

        <div className="">
          <label htmlFor="">Total</label>
          <input
            type="text"
            placeholder="Total"
            className="w-full max-w-lg h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
            value={
              finalTotal.toFixed(2) ? formatCurrency(finalTotal.toFixed(2)) : ""
            }
            disabled
          />
        </div>
      </div>
      <div className="w-full flex justify-end mt-10 pt-4">
        <button
          type="button"
          className="ml-2 inline-block rounded bg-lime-600 hover:bg-lime-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
          onClick={() => setShowModalTopRight(true)}
          disabled={!isAnyChecked}
        >
          Ver Factura
        </button>
        <button
          type="button"
          className="ml-2 inline-block rounded bg-lime-600 hover:bg-lime-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
          onClick={() => {
            invoiceGenerate();
            handleGeneratePdf();
          }}
          disabled={!isAnyChecked}
        >
          Generar Factura
        </button>
      </div>

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
            <h1>Factura #{nextInvoiceNumber}</h1>
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
              NIT: {clientData?.identification || "Cargando..."}
            </span>
            <span className="">
              TELEFONO: {clientData?.phone || "Cargando..."}
            </span>
          </div>

          <div className="flex justify-start">
            <span className="">FECHA: {new Date().toLocaleDateString()}</span>
            <span className="mx-44">
              CIUDAD: {cityData?.name || "Cargando..."}
            </span>
          </div>

          <div className="flex justify-start">
            <span className="">
              DIRECCIÓN: {clientData?.address || "Cargando..."}
            </span>
            <span className="mx-36">
              PAGO: {selectedPaymentTypeName || "0.00"}
            </span>
          </div>
        </div>

        <table className="table-auto w-full min-w-[600px] border-collapse  overflow-hidden shadow-md">
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
            {Object.keys(checkedRows)
              .filter((rowId) => checkedRows[rowId])
              .map((rowId) => {
                const row = inventories.find(
                  (item) => item.id === Number(rowId)
                );
                if (!row) return null;

                return (
                  <tr
                    key={row.id}
                    className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2"
                  >
                    <td className="py-2 text-center">
                      {selectedUnits[row.id]
                        ? formatCurrency(selectedUnits[row.id])
                        : ""}
                    </td>
                    <td className="py-2 text-center">{row.code}</td>
                    <td className="py-2 text-center">{row.item}</td>
                    <td className="py-2 text-center">
                      {selectedPrices[row.id]
                        ? formatCurrency(selectedPrices[row.id])
                        : ""}
                    </td>
                    <td className="py-2 text-center">
                      {selectedValues[row.id]
                        ? formatCurrency(selectedValues[row.id])
                        : ""}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div className="flex justify-end mt-5">
          <div>
            <p>
              SUBTOTAL:{" "}
              {subtotal.toFixed(2) ? formatCurrency(subtotal.toFixed(2)) : ""}{" "}
            </p>
            <p>DESCUENTO: {discount ? formatCurrency(discount) : ""} </p>
            <p>
              TOTAL:{" "}
              {finalTotal.toFixed(2)
                ? formatCurrency(finalTotal.toFixed(2))
                : ""}{" "}
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* <!-- Modal --> */}
        <TEModal show={showModalTopRight} setShow={setShowModalTopRight}>
          <TEModalDialog
            style={{ width: "95vw", maxWidth: "1200px" }}
            theme={{
              show: "translate-x-0 opacity-100",
              hidden: "translate-x-[100%] opacity-0",
            }}
          >
            <TEModalContent>
              <TEModalHeader className="bg-lime-700/75 text-white">
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal  dark:text-neutral-200">
                  Vista Previa
                </h5>
                {/* <!--Close button--> */}
                <button
                  type="button"
                  className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </TEModalHeader>
              {/* <!--Modal body--> */}
              <TEModalBody>
                <div>
                  <div className="flex justify-between mb-5">
                    <div>
                      <img src="/images/logo.png" className="h-16" alt="" />
                    </div>
                    <div className="text-5xl text-lime-800/50">
                      <h1>Factura #{nextInvoiceNumber}</h1>
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
                        NIT: {clientData?.identification || "Cargando..."}
                      </span>
                      <span className="">
                        TELEFONO: {clientData?.phone || "Cargando..."}
                      </span>
                    </div>

                    <div className="flex justify-start">
                      <span className="">
                        FECHA: {new Date().toLocaleDateString()}
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
                        PAGO: {selectedPaymentTypeName || "0.00"}
                      </span>
                    </div>
                  </div>

                  <table className="table-auto w-full min-w-[600px] border-collapse  overflow-hidden shadow-md">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th colSpan={5}>REMISION</th>
                      </tr>
                      <tr>
                        <th className="px-5 py-3 text-center">Cantidad</th>
                        <th className="px-16 py-3 text-center">Codigo</th>
                        <th className="px-16 py-3 text-center">Descripcion</th>
                        <th className="px-16 py-3 text-center">
                          Precio Unitario
                        </th>
                        <th className="px-10 py-3 text-center">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(checkedRows)
                        .filter((rowId) => checkedRows[rowId])
                        .map((rowId) => {
                          const row = inventories.find(
                            (item) => item.id === Number(rowId)
                          );
                          if (!row) return null;

                          return (
                            <tr
                              key={row.id}
                              className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2"
                            >
                              <td className="py-2 text-center">
                                {selectedUnits[row.id]
                                  ? formatCurrency(selectedUnits[row.id])
                                  : ""}
                              </td>
                              <td className="py-2 text-center">{row.code}</td>
                              <td className="py-2 text-center">{row.item}</td>
                              <td className="py-2 text-center">
                                {selectedPrices[row.id]
                                  ? formatCurrency(selectedPrices[row.id])
                                  : ""}
                              </td>
                              <td className="py-2 text-center">
                                {selectedValues[row.id]
                                  ? formatCurrency(selectedValues[row.id])
                                  : ""}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  <div className="flex justify-end mt-5">
                    <div>
                      <p>
                        SUBTOTAL:{" "}
                        {subtotal.toFixed(2)
                          ? formatCurrency(subtotal.toFixed(2))
                          : ""}{" "}
                      </p>
                      <p>
                        DESCUENTO: {discount ? formatCurrency(discount) : ""}{" "}
                      </p>
                      <p>
                        TOTAL:{" "}
                        {finalTotal.toFixed(2)
                          ? formatCurrency(finalTotal.toFixed(2))
                          : ""}{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </TEModalBody>
              <TEModalFooter>
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="inline-block rounded bg-primary-100 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-primary-700 transition duration-150 ease-in-out hover:bg-primary-accent-100 focus:bg-primary-accent-100 focus:outline-none focus:ring-0 active:bg-primary-accent-200"
                    onClick={handleCloseModal}
                  >
                    Salir
                  </button>
                </TERipple>
              </TEModalFooter>
            </TEModalContent>
          </TEModalDialog>
        </TEModal>
      </div>
    </div>
  );
}

export default TableForBill;
