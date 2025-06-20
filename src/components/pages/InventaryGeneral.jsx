import React from "react";
import TableReport from "../resources/TableReport";
import { useState, useEffect } from "react";
import {
  TERipple,
  TEModal,
  TEModalDialog,
  TEModalContent,
  TEModalHeader,
  TEModalBody,
  TEModalFooter,
} from "tw-elements-react";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config/apiConfig";

function InventaryGeneral({ onLogout = () => {} }) {
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [travelerPrice, setTravelerPrice] = useState("");
  const [cityPrice, setCityPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loadingScreen, setLoadingScreen] = useState(false);
  const resetForm = () => {
    setCode("");
    setItem("");
    setCategory("");
    setStock("");
    setTravelerPrice("");
    setCityPrice("");
    setWholesalePrice("");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data.data);
        } else {
          if (
            !response.ok &&
            response.redirected &&
            response.url.includes("login_failed")
          ) {
            onLogout();
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    setLoadingScreen(true);

    const inventoryData = {
      code: code,
      item: item,
      category_id: category,
      stock: stock,
      traveler_price: travelerPrice,
      city_price: cityPrice,
      wholesale_price: wholesalePrice,
    };

    const movementsData = {
      movement_type: "Entrada",
      product_id: code,
      quantity: stock,
      description: "Entrada por inventario",
    };

    const productData = {
      code: code,
      name: item,
      category_id: category,
    };

    try {
      const productResponse = await fetch(`${API_BASE_URL}/products/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!productResponse.ok) {
        const error = await productResponse.json();
        if (error.fields) {
          const [firstKey] = Object.entries(error.fields)[0];
          toast.error(
            `¡Error en producto: ${getFieldName(firstKey)} es requerido!`
          );
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/inventory/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventoryData),
      });

      if (response.ok) {
        await response.json();

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
        await responseMovements.json();
        toast.success("¡Producto agregado con exito!");
        resetForm();
        setShowModalTopRight(false);
        setRefreshKey((prevKey) => prevKey + 1);
      } else {
        const error = await response.json();

        if (error.fields) {
          const [firstKey] = Object.entries(error.fields)[0];
          toast.error(`¡El campo ${getFieldName(firstKey)} es requerido!`);
        }
      }

      function getFieldName(field) {
        const fieldNames = {
          code: "Codigo",
          item: "Item",
          category_id: "Categoria",
          stock: "Stock",
          traveler_price: "Precio Viajero",
          city_price: "Precio Ciudad",
          wholesale_price: "Precio al Por Mayor",
        };
        return fieldNames[field] || field;
      }
    } catch (error) {
      toast.error("¡Error de servidor!");
    }finally{
      setLoadingScreen(false);
    }
  };

  const handleDownloadTemplate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    setLoadingScreen(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/exel_document/download_template`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_inventario.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Plantilla descargada con éxito");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al descargar la plantilla");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al descargar la plantilla");
    }finally{
      setLoadingScreen(false);
    }
  };

  const handleUploadExcel = async () => {
    const token = localStorage.getItem("token");
    const fileInput = document.getElementById("file-upload");

    if (!token) {
      console.error("No token found");
      toast.error("Error de autenticación");
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      toast.error("Por favor, selecciona un archivo Excel");
      return;
    }

    const file = fileInput.files[0];

    if (!file.name.endsWith(".xlsx")) {
      toast.error("El archivo debe ser un Excel (.xlsx)");
      return;
    }

    setLoadingScreen(true);

    const formData = new FormData();
    formData.append("inventoryFile", file);

    try {
      const response = await fetch(`${API_BASE_URL}/exel_document/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar el archivo");
      }

      const data = await response.json();
      toast.success(data.message || "Archivo cargado exitosamente");
      setFileName("");
      fileInput.value = "";
      setShowModal(false);
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al procesar el archivo");
    }finally{
      setLoadingScreen(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModalTopRight(false);
  };

  return (
    <div className="w-full px-3 content-center">
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
      <div className="-mt-[72px]  w-full text-2xl mx-3 text-neutral-100 flex font-semibold italic text-shadow">
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Inventario &nbsp;
        </h1>
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          General
        </h1>
      </div>
      <div className="my-20"></div>

      <div className="flex flex-col items-center">
        <div className="py-3">
          <div className="-mb-10 float-end absolute right-[700px] z-10">
            <button
              className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-700"
              onClick={() => setShowModal(true)}
            >
              Cargar Excel
            </button>
          </div>

          <div className="-mb-10 float-end absolute right-[540px] z-10">
            <button
              className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-700"
              onClick={() => setShowModalTopRight(true)}
            >
              Agregar Producto
            </button>
          </div>

          <div className="">
            <TableReport key={refreshKey} onLogout={onLogout} />
          </div>
        </div>
      </div>

      <div>
        {/* <!-- Modal --> */}
        <TEModal show={showModalTopRight} setShow={setShowModalTopRight}>
          <TEModalDialog
            theme={{
              show: "translate-x-0 opacity-100",
              hidden: "translate-x-[100%] opacity-0",
            }}
            size="lg"
          >
            <TEModalContent>
              <TEModalHeader className="bg-lime-700/75 text-white">
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal dark:text-neutral-200">
                  Agregar Producto
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
              <TEModalBody>
                <div className="flex py-3">
                  <input
                    type="text"
                    placeholder="Código"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Item"
                    className="w-72 h-10 px-4 mx-3 rounded-md border-2 border-lime-800 outline-none"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Cantidad"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>

                <div className="flex py-3">
                  <select
                    name=""
                    id=""
                    className="w-96 h-10 px-2 rounded-md border-2 border-lime-800 outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Seleccionar Categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.type}
                      </option>
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
                    value={travelerPrice}
                    onChange={(e) => setTravelerPrice(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Ciudad"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={cityPrice}
                    onChange={(e) => setCityPrice(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Por Mayor"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                  />
                </div>
              </TEModalBody>
              <TEModalFooter>
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
          <TEModalDialog>
            <TEModalContent>
              <TEModalHeader>
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal text-lime-800/90 dark:text-neutral-200">
                  Cargar Archivo Excel
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
              <TEModalBody>
                <div className="flex justify-center items-center">
                  <label
                    htmlFor="file-upload"
                    className={`w-96 h-28 flex flex-col items-center justify-center border-2 ${
                      fileName
                        ? "border-solid border-lime-600"
                        : "border-dashed border-lime-800"
                    } rounded-md cursor-pointer bg-lime-50 text-lime-800 hover:bg-lime-100 transition relative`}
                  >
                    {fileName ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 mb-1 text-lime-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-center px-2 truncate w-full">
                          {fileName}
                        </span>
                        <span className="text-xs text-lime-600">
                          Archivo Excel seleccionado
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 mb-1 text-lime-800"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 12l4-4m0 0l4 4m-4-4v12"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Selecciona o arrastra tu archivo aquí
                        </span>
                        <span className="text-xs text-lime-700">
                          Solo archivos Excel (.xlsx)
                        </span>
                      </>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          if (!file.name.endsWith(".xlsx")) {
                            toast.error(
                              "Por favor, cargar un archivo Excel (.xlsx)"
                            );
                            setFileName("");
                            e.target.value = "";
                            return;
                          }
                          setFileName(file.name);
                          // Guardar el archivo en el estado si es necesario
                          // setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                  {fileName && (
                    <button
                      onClick={() => {
                        setFileName("");
                        document.getElementById("file-upload").value = ""; // Limpiar el input
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Eliminar archivo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex justify-center items-center mt-5 mb-5">
                  <button
                    type="button"
                    onClick={handleUploadExcel}
                    className="ml-1 mx-3 inline-block rounded bg-lime-600 hover:bg-lime-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  >
                    Cargar Excel
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="ml-1 inline-block rounded bg-lime-600 hover:bg-lime-700 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  >
                    Descargar Estructura
                  </button>
                </div>
              </TEModalBody>
            </TEModalContent>
          </TEModalDialog>
        </TEModal>
      </div>
    </div>
  );
}

export default InventaryGeneral;
