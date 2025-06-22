import React, { useState, useEffect } from "react";
import Pagination from "./Pagination";
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

function TableCategory({ onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingScreen, setLoadingScreen] = useState(false);

  const fetchCategories = async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories?search=${searchTerm}&page=${currentPage}&per_page=${perPage}`,
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
        setCategories(data.data);
        setTotalPages(data.last_page);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        console.error(`Error al obtener las categorías: ${response.status}`);
        const errorData = await response.json();
        console.error("Detalles del error:", errorData);
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

    const delayDebounceFn = setTimeout(() => {
      fetchCategories(token);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, perPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditClick = (catagory) => {
    setSelectedCategory(catagory);
    setShowModalTopRight(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      setLoadingScreen(true);

      const response = await fetch(
        `${API_BASE_URL}/categories/update/${selectedCategory.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedCategory),
        }
      );

      if (response.ok) {
        await response.json();

        toast.success("¡Categoria actualizada exitosamente!");
        setShowModalTopRight(false);
        setSelectedCategory(null);
        fetchCategories(token);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        toast.error("¡Error al actualizar la categoria!");
      }
    } catch (error) {
      toast.error("¡Error de servidor!");
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleCloseModal = () => {
    setShowModalTopRight(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id) => {
    const userConfirmed = await new Promise((resolve) => {
      toast.info(
        <div>
          <p>¿Estás seguro de que deseas eliminar esta categoria?</p>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              style={{
                padding: "5px 10px",
                background: "#3ad130",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
            >
              Sí, eliminar
            </button>
            <button
              style={{
                padding: "5px 10px",
                background: "#d33",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
        }
      );
    });

    if (!userConfirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    setLoadingScreen(true);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setCategories((prevClients) =>
          prevClients.filter((client) => client.id !== id)
        );
        toast.success("¡Categoria eliminada con exito!");
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        await response.json();
        toast.error("¡Hubo un error al intentar eliminar la categoria!");
      }
    } catch (error) {
      toast.error("¡Error de servidor!");
    } finally {
      setLoadingScreen(false);
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
          className="w-full max-w-lg h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

        <table className="table-auto w-[1610px] min-w-[600px]  border-collapse rounded-md overflow-hidden shadow-md">
          <thead className="bg-lime-700/15 text-lime-900">
            <tr>
              <th className="px-5 py-2 text-center">Id</th>
              <th className="px-16 py-2 text-center">Tipo</th>
              <th className="px-5 py-2 text-center">
                <img
                  src="/images/icons/edit-black-2.png"
                  alt="Editar"
                  className="inline h-7"
                />
              </th>
              <th className="px-5 py-2 text-center">
                <img
                  src="/images/icons/trash-black.png"
                  alt="Eliminar"
                  className="inline h-8"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-2 text-center">
                  Cargando...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  No hay categorias disponibles.
                </td>
              </tr>
            ) : (
              categories.map((row) => (
                <tr
                  key={row.id}
                  className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                >
                  <td className="py-2 text-center">{row.id}</td>
                  <td className="py-2 text-center">{row.type}</td>
                  <td className="py-2 text-center">
                    <button onClick={() => handleEditClick(row)}>
                      <img
                        src="/images/icons/edit.png"
                        alt="Editar"
                        className="inline h-7 box-shadow-image"
                      />
                    </button>
                  </td>
                  <td className="py-2 text-center">
                    <button onClick={() => handleDelete(row.id)}>
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
      {categories.length > 0 ? (
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
          >
            <TEModalContent>
              <TEModalHeader className="bg-lime-700/75 text-white">
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal dark:text-neutral-200">
                  Editar Categoria
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
                    placeholder="Nombre"
                    className="w-full h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedCategory?.type || ""}
                    onChange={(e) =>
                      setSelectedCategory({
                        ...selectedCategory,
                        type: e.target.value,
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
    </div>
  );
}

export default TableCategory;
