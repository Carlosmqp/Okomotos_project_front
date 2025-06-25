import React, { useState, useEffect } from "react";
import Pagination from "./Pagination";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {
  TERipple,
  TEModal,
  TEModalDialog,
  TEModalContent,
  TEModalHeader,
  TEModalBody,
  TEModalFooter,
} from "tw-elements-react";
import moment from "moment";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API_BASE_URL from "../../config/apiConfig";

function TableReport({ onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm2, setSearchTerm2] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(5);
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [inventories, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventary, setSelectedInventary] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [originalQuantity, setOriginalQuantity] = useState("");
  const [newCode, setNewCode] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [categorySelect, setCategorySelect] = useState([]);
  const [employee, setEmployee] = useState("");
  const [employ, setEmploy] = useState([]);
  const [prevQuantity, setPrevQuantity] = useState("");
  const [newStock, setNewStock] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);

  const fetchInventary = async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/inventory?search=${searchTerm2}&page=${currentPage}&per_page=${perPage}`,
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
        console.error(`Failed to fetch inventories: ${response.status}`);
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
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmploy(data.data);
        } else if (
          !response.ok &&
          response.redirected &&
          response.url.includes("login_failed")
        ) {
          onLogout();
        } else {
          console.error(`Failed to fetch employees: ${response.status}`);
          try {
            const errorData = await response.json();
            console.error("Error details:", errorData);
          } catch (jsonError) {
            console.error("Response is not JSON:", jsonError);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchEmployee();

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        setCategorySelect(data.data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };

    fetchCategories();
    const delayDebounceFn = setTimeout(() => {
      fetchInventary(token);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm2, currentPage, perPage, refreshTrigger]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditClick = (inventories) => {
    setSelectedInventary(inventories);
    setShowModalTopRight(true);
  };

  const exportToExcel = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      let url = `${API_BASE_URL}/inventory?search=${searchTerm2}&per_page=10000`;

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
        toast.error("No hay datos para exportar");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        allData.map((row) => ({
          Código: row.id || "N/A",
          Fecha: row.updated_at || "N/A",
          Item: row.item || "N/A",
          Categoria: row.category.type || "N/A",
          Stock: row.stock || "N/A",
          Precio_Viajero: row.traveler_price || "N/A",
          Precio_Ciudad: row.city_price || "N/A",
          Precio_Mayor: row.wholesale_price || "N/A",
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

      saveAs(excelBlob, "Inventario_General.xlsx");
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
      let url = `${API_BASE_URL}/inventory?search=${searchTerm2}&per_page=10000`;

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
        toast.error("No hay datos para exportar");
        return;
      }

      const doc = new jsPDF();

      doc.setTextColor(44, 68, 27);
      doc.text("Inventario General", 14, 10);

      autoTable(doc, {
        head: [
          [
            "Código",
            "Fecha",
            "Item",
            "Categoría",
            "Stock",
            "Precio Viajero",
            "Precio Ciudad",
            "Precio Mayor",
          ],
        ],
        body: allData.map((row) => [
          row.code || "N/A",
          row.created_at
            ? dayjs(row.created_at).format("DD/MM/YYYY HH:mm:ss")
            : "N/A",
          row.item || "N/A",
          row.category.type || "N/A",
          row.stock || "N/A",
          row.traveler_price || "N/A",
          row.city_price || "N/A",
          row.wholesale_price || "N/A",
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

      doc.save("Inventario_General.pdf");
    } catch (error) {}
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }
    setLoadingScreen(true);

    try {
      const inventaryData = {
        item: selectedInventary.item,
        category_id: selectedInventary.category_id,
        stock: newStock ? newStock : selectedInventary.stock,
        traveler_price: selectedInventary.traveler_price,
        city_price: selectedInventary.city_price,
        wholesale_price: selectedInventary.wholesale_price,
      };

      // console.log(inventaryData);

      const response = await fetch(
        `${API_BASE_URL}/inventory/update/${selectedInventary.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inventaryData),
        }
      );

      const productData = {
        name: selectedInventary.item,
        category_id: selectedInventary.category_id,
      };

      const productResponse = await fetch(
        `${API_BASE_URL}/products/update/${selectedInventary.code}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );
      console.log(productResponse);

      if (!productResponse.ok) {
        const error = await productResponse.json();
        toast.error("¡Error al actualizar el producto básico!");
        return;
      }

      const movementsData = {
        movement_type: "Entrada",
        product_id: selectedInventary.id,
        quantity: newStock - selectedInventary.stock,
        description: "Entrada por inventario",
      };

      if (response.ok) {
        await response.json();

        if (newStock > selectedInventary.stock) {
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
            return;
          } else if (!responseMovements.ok) {
            await responseMovements.text();
            toast.error("¡Ah ocurrido un error con los movimientos!");
            return;
          }
        }

        toast.success("¡Producto actualizado con exito!");
        fetchInventary(token);
        setShowModalTopRight(false);
        setSelectedInventary(null);
      } else {
        toast.error("¡Error al actualizar el producto!");
      }
    } catch (error) {
      toast.error("¡Error de servidor!");
      console.error("Error:", error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleCloseModal = () => {
    setShowModalTopRight(false);
    setSelectedInventary(null);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    if (!selectedRow) return;

    setLoadingScreen(true);

    try {
      let apiUrl = `${API_BASE_URL}/inventory/update/${selectedRow.id}`;
      let options = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (selectAll) {
        options.method = "DELETE";
        apiUrl = `${API_BASE_URL}/inventory/delete/${selectedRow.id}`;

        const productDeleteResponse = await fetch(
          `${API_BASE_URL}/products/delete/${selectedRow.code}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!productDeleteResponse.ok) {
          const error = await productDeleteResponse.json();
          toast.error("Error al eliminar el producto básico");
          return;
        }
      } else {
        if (!quantity || quantity <= 0) {
          toast.error("Ingresa una cantidad válida");
          return;
        }

        const newStock = selectedRow.stock - parseInt(quantity, 10);

        if (newStock < 0) {
          toast.error("No puedes restar más de lo disponible en stock");
          return;
        }

        options.method = "POST";
        options.body = JSON.stringify({ stock: newStock });
      }

      const response = await fetch(apiUrl, options);

      const movementsData = {
        movement_type: "Salida",
        product_id: selectedRow.id,
        quantity: selectAll ? selectedRow.stock : quantity,
        description: "Salida de inventario",
      };

      if (response.ok) {
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
          return;
        } else if (!responseMovements.ok) {
          const errorText = await responseMovements.text();
          console.error("Failed to create movement", errorText);
          toast.error("¡Ah ocurrido un error con los movimientos!");
          return;
        }

        toast.success(selectAll ? "Producto eliminado" : "Stock actualizado");
        fetchInventary(token);
        setShowModalDelete(false);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        toast.error("Error en la operación");
      }
    } catch (error) {
      toast.error("Error de servidor");
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleOpenModal = async (row) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    setSelectedRow(row);
    setNewCode("");
    setQuantity("");
    setEmployee("");
    setSelectAll(false);
    setPrevQuantity("");

    try {
      const response = await fetch(`${API_BASE_URL}/inventory_samples`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        const existingSample = data.data.find(
          (sample) => Number(sample.inventary_code_id) === Number(row.code)
        );

        if (existingSample) {
          setNewCode(existingSample.code);
          setQuantity(existingSample.stock);
          setOriginalQuantity(existingSample.stock);
          setEmployee(existingSample.employee_id);
          setIsDisabled(true);
        }
      } else {
        toast.error(`Error al obtener muestras: ${response.status}`);
      }
    } catch (error) {
      toast.error("Error al buscar en inv_samples:", error);
    }

    setShowModal(true);
  };

  const handleOpenModalDelete = (row) => {
    setSelectedRow(row);
    setQuantity("");
    setSelectAll(false);
    setShowModalDelete(true);
  };

  const handleCheckboxChange = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const sampleDataResponse = await fetch(
      `${API_BASE_URL}/inventory_samples?code=${newCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      !sampleDataResponse.ok &&
      sampleDataResponse.redirected &&
      sampleDataResponse.url.includes("login_failed")
    ) {
      onLogout();
      return;
    } else if (!sampleDataResponse.ok) {
      const errorText = await sampleDataResponse.text();
      console.error("Error al verificar existencia", errorText);
      toast.error("Error al verificar existencia del código");
      return;
    }

    const responseData = await sampleDataResponse.json();

    const existingData = responseData.data?.find(
      (item) => item.code === newCode
    );

    const existingStock = existingData?.stock ?? 0;

    if (!selectAll) {
      setPrevQuantity(quantity);
      setQuantity(selectedRow.stock + existingStock);
    } else {
      setQuantity(prevQuantity);
    }
    setSelectAll(!selectAll);
  };

  const handleSaveSample = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    if (!selectedRow) return;

    setLoadingScreen(true);

    const sampleData = {
      code: newCode,
      item: selectedRow.item || "",
      category_id: selectedRow.category_id || null,
      stock: quantity || 0,
      employee_id: employee,
      inventary_code_id: selectedRow.code,
    };

    let original = parseFloat(originalQuantity);
    let nuevo = parseFloat(quantity);

    
    if (isNaN(original)) {
      original = 0;
    }

    const movimiento = nuevo - original;


    const movementsData = {
      movement_type: "Muestra",
      product_id: selectedRow.id,
      quantity: movimiento,
      description: "Entrada por inventario muestras",
    };

    try {
      const checkResponse = await fetch(
        `${API_BASE_URL}/inventory_samples?code=${newCode}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        !checkResponse.ok &&
        checkResponse.redirected &&
        checkResponse.url.includes("login_failed")
      ) {
        onLogout();
        return;
      } else if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        console.error("Error al verificar existencia", errorText);
        toast.error("Error al verificar existencia del código");
        return;
      }

      const responseData = await checkResponse.json();

      const existingItem = responseData.data?.find(
        (item) => item.code === newCode
      );

      // console.log(existingItem);
      const existingStock = existingItem?.stock ?? 0;

      if (selectedRow.stock + existingStock < quantity) {
        toast.error(
          "¡La cantidad digitada supera valor maximo a ingregar que es de " +
            (selectedRow.stock + existingStock) +
            "   porfavor revisar!"
        );
        return;
      }

      let response;

      if (existingItem) {
        response = await fetch(
          `${API_BASE_URL}/inventory_samples/update/${existingItem.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sampleData),
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
          const errorText = await response.text();
          console.error("Error al actualizar la muestra", errorText);
          toast.error("Error al actualizar la muestra, verificar");
          return;
        } else {
          setRefreshTrigger((prev) => !prev);
        }
      } else {
        response = await fetch(`${API_BASE_URL}/inventory_samples/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sampleData),
        });

        if (
          !response.ok &&
          response.redirected &&
          response.url.includes("login_failed")
        ) {
          onLogout();
          return;
        } else if (!response.ok) {
          const errorText = await response.text();
          console.error("Error al guardar la muestra", errorText);
          toast.error("Error al guardar la muestra, verificar");
          return;
        } else {
          setRefreshTrigger((prev) => !prev);
        }
      }

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
        return;
      } else if (!responseMovements.ok) {
        const errorText = await responseMovements.text();
        console.error("Failed to create movement", errorText);
        toast.error("¡Ah ocurrido un error con los movimientos!");
        return;
      }

      const updatedStock = selectedRow.stock - (quantity - existingStock);
      const responseStockUpdate = await fetch(
        `${API_BASE_URL}/inventory/update/${selectedRow.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: updatedStock,
          }),
        }
      );

      if (
        !responseStockUpdate.ok &&
        responseStockUpdate.redirected &&
        responseStockUpdate.url.includes("login_failed")
      ) {
        onLogout();
        return;
      } else if (!responseStockUpdate.ok) {
        const errorText = await responseStockUpdate.text();
        console.error("Failed to update stock", errorText);
        toast.error("¡Error al actualizar muestras!");
        return;
      }

      toast.success(
        existingItem
          ? "Muestra actualizada correctamente"
          : "Muestra creada correctamente"
      );
      fetchInventary(token);
      setShowModal(false);
    } catch (error) {
      toast.error("¡Error de servidor!");
    } finally {
      setLoadingScreen(false);
    }
  };

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

  const stockConsultado = selectedInventary?.stock || 0;

  const handleStockChange = (e) => {
    const newValue = e.target.value;
    setSelectedInventary({
      ...selectedInventary,
      stockDigitado: newValue,
    });
    setNewStock(newValue);
  };

  const handleBlur = () => {
    const stockIngresado = parseInt(selectedInventary?.stockDigitado, 10) || 0;

    if (stockIngresado <= stockConsultado) {
      toast.error("El valor digitado debe ser mayor al existente en stock");
      setSelectedInventary({
        ...selectedInventary,
        stockDigitado: stockConsultado,
      });
    }
  };

  const handleInputChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleBlurSample = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const numericQuantity = Number(quantity) || 0;

    const checkResponse = await fetch(
      `${API_BASE_URL}/inventory_samples?code=${newCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      !checkResponse.ok &&
      checkResponse.redirected &&
      checkResponse.url.includes("login_failed")
    ) {
      onLogout();
      return;
    } else if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error("Error al verificar existencia", errorText);
      toast.error("Error al verificar existencia del código");
      return;
    }

    const responseData = await checkResponse.json();

    const existingItem = responseData.data?.find(
      (item) => item.code === newCode
    );

    const existingStock = existingItem?.stock ?? 0;

    if (numericQuantity <= existingStock) {
      toast.error(`¡El valor debe ser mayor a ${existingStock}!`);
      setQuantity(existingStock);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
      {/* Modal de Carga */}
      {loadingScreen && (
        <div
          className="fixed inset-0 bg-lime-800/50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      )}
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

      {/* Table */}
      <table className="table-auto w-[1610px] min-w-full border-collapse rounded-md overflow-hidden shadow-md">
        <thead className="bg-lime-700/15 text-lime-900">
          <tr>
            <th className="px-5 py-2 text-center">Código</th>
            <th className="px-16 py-2 text-center">Fecha</th>
            <th className="px-16 py-2 text-center">Item</th>
            <th className="px-16 py-2 text-center">Categoría</th>
            <th className="px-10 py-2 text-center">Stock</th>
            <th className="px-16 py-2 text-center">Precio Viajero</th>
            <th className="px-16 py-2 text-center">Precio Ciudad</th>
            <th className="px-16 py-2 text-center">Precio Al Por Mayor</th>
            <th className="px-16 py-2 text-center">
              <img
                src="/images/icons/inventary3.png"
                alt="Editar"
                className="inline h-10 w-24"
              />
            </th>
            <th className="px-5 py-2  text-center">
              <img
                src="/images/icons/edit-black-2.png"
                alt="Editar"
                className="inline h-7 w-20"
              />
            </th>
            <th className="px-5 py-2 text-center">
              <img
                src="/images/icons/trash-black.png"
                alt="Eliminar"
                className="inline h-8 w-20"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="py-2 text-center">
                Cargando...
              </td>
            </tr>
          ) : inventories.length === 0 ? (
            <tr>
              <td colSpan="11" className="py-4 text-center text-gray-500">
                No hay información disponibles.
              </td>
            </tr>
          ) : (
            inventories.map((row) => (
              <tr
                key={row.id}
                className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
              >
                <td className="py-2 text-center">{row.code}</td>
                <td className="py-2 text-center">
                  {moment(row.created_at).format("DD/MM/YYYY HH:mm:ss")}
                </td>
                <td className="py-2 text-center">{row.item}</td>
                <td className="py-2 text-center">{row.category.type}</td>
                <td className="py-2 text-center">{formatNumber(row.stock)}</td>
                <td className="py-2 text-center">
                  {formatCurrency(row.traveler_price)}
                </td>
                <td className="py-2 text-center">
                  {formatCurrency(row.city_price)}
                </td>
                <td className="py-2 text-center">
                  {formatCurrency(row.wholesale_price)}
                </td>
                <td className="py-2 text-center">
                  <button
                    title="Mover a Muestras"
                    onClick={() => handleOpenModal(row)}
                    className="px-4 py-2 text-white rounded"
                  >
                    <img
                      src="/images/icons/inventary3.png"
                      alt="Add"
                      className="inline h-10 w-10"
                    />
                  </button>
                </td>
                <td className="py-2 text-center">
                  <button title="Editar" onClick={() => handleEditClick(row)}>
                    <img
                      src="/images/icons/edit.png"
                      alt="Editar"
                      className="inline h-7 box-shadow-image"
                      onClick={() => setShowModalTopRight(true)}
                    />
                  </button>
                </td>
                <td className="py-2 text-center">
                  <button
                    title="Eliminar de Stock"
                    onClick={() => handleOpenModalDelete(row)}
                  >
                    <img
                      src="/images/icons/trash.png"
                      alt="Eliminar"
                      className="inline h-8 box-shadow-image"
                    />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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

      <div>
        {/* <!-- Modal --> */}
        <TEModal show={showModalTopRight} setShow={setShowModalTopRight}>
          <TEModalDialog
            theme={{
              show: "translate-x-0 opacity-100",
              hidden: "translate-x-[-100%] opacity-0",
            }}
            size="lg"
          >
            <TEModalContent>
              <TEModalHeader className="bg-lime-700/75 text-white">
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal dark:text-neutral-200">
                  Editar Producto
                </h5>
                {/* <!--Close button--> */}
                <button
                  type="button"
                  className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                  onClick={() => setShowModalTopRight(false)}
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
              <TEModalBody className="bg-white">
                <div className="flex py-3">
                  <input
                    type="text"
                    placeholder="Código"
                    disabled
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedInventary?.code || ""}
                    onChange={(e) =>
                      setSelectedInventary({
                        ...selectedInventary,
                        code: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Item"
                    className="w-72 h-10 px-4 mx-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedInventary?.item || ""}
                    onChange={(e) =>
                      setSelectedInventary({
                        ...selectedInventary,
                        item: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Cantidad"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={
                      selectedInventary?.stockDigitado ||
                      selectedInventary?.stock
                    }
                    onChange={handleStockChange}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="flex py-3">
                  <select
                    name=""
                    id=""
                    className="w-96 h-10 px-2 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedInventary?.category_id || ""}
                    onChange={(e) =>
                      setSelectedInventary({
                        ...selectedInventary,
                        category_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar Categoria</option>
                    {categorySelect.map((category) => (
                      <>
                        {category.id === selectedInventary?.category_id ? (
                          <option
                            key={category.id}
                            value={category.id}
                            selected
                          >
                            {category.type}
                          </option>
                        ) : (
                          <option key={category.id} value={category.id}>
                            {category.type}
                          </option>
                        )}
                      </>
                    ))}
                  </select>
                </div>

                <h5 className="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200">
                  Tipo De Precio
                </h5>

                <div className="flex py-3">
                  <input
                    type="text"
                    placeholder="Viajero"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedInventary?.traveler_price || ""}
                    onChange={(e) =>
                      setSelectedInventary({
                        ...selectedInventary,
                        traveler_price: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Ciudad"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedInventary?.city_price || ""}
                    onChange={(e) =>
                      setSelectedInventary({
                        ...selectedInventary,
                        city_price: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Por Mayor"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedInventary?.wholesale_price || ""}
                    onChange={(e) =>
                      setSelectedInventary({
                        ...selectedInventary,
                        wholesale_price: e.target.value,
                      })
                    }
                  />
                </div>
              </TEModalBody>
              <TEModalFooter className="bg-white">
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="inline-block rounded bg-primary-100 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-primary-700 transition duration-150 ease-in-out hover:bg-primary-accent-100 focus:bg-primary-accent-100 focus:outline-none focus:ring-0 active:bg-primary-accent-200"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                </TERipple>
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="ml-1 inline-block rounded bg-lime-600 hover:bg-lime-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    onClick={handleSave}
                  >
                    Guardar
                  </button>
                </TERipple>
              </TEModalFooter>
            </TEModalContent>
          </TEModalDialog>
        </TEModal>
      </div>

      <div>
        {/* <!-- Modal --> */}
        <TEModal show={showModal} setShow={setShowModal}>
          <TEModalDialog size="lg">
            <TEModalContent>
              <TEModalHeader className="bg-lime-700/75 text-white">
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200">
                  Cargar Muestras
                </h5>
                {/* <!--Close button--> */}
                <button
                  type="button"
                  className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                  onClick={() => setShowModal(false)}
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
              <TEModalBody className="bg-white">
                <div className="flex justify-center items-center content-center">
                  <div>
                    <input
                      type="text"
                      placeholder="Codigo Producto"
                      className="w-full h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      disabled={isDisabled}
                    />
                  </div>
                  <div className="mx-5">
                    <input
                      type="text"
                      placeholder="Cantidad"
                      className="w-full h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                      value={quantity}
                      onChange={handleInputChange}
                      onBlur={handleBlurSample}
                    />
                  </div>

                  <div className="flex py-3">
                    <select
                      name=""
                      id=""
                      className="w-60 h-10 px-2 rounded-md border-2 border-lime-800 outline-none"
                      value={employee}
                      onChange={(e) => setEmployee(e.target.value)}
                    >
                      <option value="">Seleccionar Empleado</option>
                      {Array.isArray(employ) &&
                        employ.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="justify-center items-center content-center mt-8">
                    <input
                      type="checkbox"
                      className="w-full max-w-lg h-8 px-4 rounded-md border-2 border-lime-800 outline-none"
                      checked={selectAll}
                      onChange={handleCheckboxChange}
                    />
                    <label className="ml-3" htmlFor="">
                      Todo
                    </label>
                  </div>
                </div>
              </TEModalBody>
              <TEModalFooter className="bg-white">
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="inline-block rounded bg-primary-100 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-primary-700 transition duration-150 ease-in-out hover:bg-primary-accent-100 focus:bg-primary-accent-100 focus:outline-none focus:ring-0 active:bg-primary-accent-200"
                    onClick={() => setShowModal(false)}
                  >
                    Cerrrar
                  </button>
                </TERipple>
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="ml-1 inline-block rounded bg-lime-600 hover:bg-lime-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    onClick={handleSaveSample}
                  >
                    Guardar
                  </button>
                </TERipple>
              </TEModalFooter>
            </TEModalContent>
          </TEModalDialog>
        </TEModal>
      </div>

      <div>
        {/* <!-- Modal --> */}
        <TEModal show={showModalDelete} setShow={setShowModalDelete}>
          <TEModalDialog>
            <TEModalContent>
              <TEModalHeader className="bg-lime-700/75 text-white">
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200">
                  Eliminar de el inventario
                </h5>
                {/* <!--Close button--> */}
                <button
                  type="button"
                  className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                  onClick={() => setShowModalDelete(false)}
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
              <TEModalBody className="bg-white">
                <div className="flex justify-center items-center content-center">
                  <div>
                    <input
                      type="text"
                      placeholder="Cantidad"
                      className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                      value={quantity}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="justify-center items-center content-center mt-8">
                    <input
                      type="checkbox"
                      className="w-full max-w-lg h-8 px-4 rounded-md border-2 border-lime-800 outline-none"
                      checked={selectAll}
                      onChange={handleCheckboxChange}
                    />
                    <label className="ml-3" htmlFor="">
                      Todo
                    </label>
                  </div>
                </div>
              </TEModalBody>
              <TEModalFooter className="bg-white">
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="inline-block rounded bg-primary-100 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-primary-700 transition duration-150 ease-in-out hover:bg-primary-accent-100 focus:bg-primary-accent-100 focus:outline-none focus:ring-0 active:bg-primary-accent-200"
                    onClick={() => setShowModalDelete(false)}
                  >
                    Cerrrar
                  </button>
                </TERipple>
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="ml-1 inline-block rounded bg-lime-600 hover:bg-lime-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    onClick={handleDelete}
                  >
                    Eliminar
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

export default TableReport;
