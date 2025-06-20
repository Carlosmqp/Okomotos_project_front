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
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../config/apiConfig";

function TableClient({ onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [clients, setClients] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingScreen, setLoadingScreen] = useState(false);

  const fetchClients = async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/clients?search=${searchTerm}&page=${currentPage}&per_page=${perPage}`,
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
        setClients(data.data);
        setTotalPages(data.last_page);
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

    const fetchCity = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cities`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCities(data);
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
      } finally {
        setLoading(false);
      }
    };
    fetchCity();
    const delayDebounceFn = setTimeout(() => {
      fetchClients(token);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, perPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setShowModalTopRight(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      setLoadingScreen(true);

      const response = await fetch(
        `${API_BASE_URL}/clients/update/${selectedClient.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedClient),
        }
      );

      if (response.ok) {
        await response.json();

        toast.success("¡Cliente Modificado!");
        setShowModalTopRight(false);
        setSelectedClient(null);
        fetchClients(token);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        toast.error("¡Ah ocurrido un error!");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleCloseModal = () => {
    setShowModalTopRight(false);
    setSelectedClient(null);
  };

  const handleDelete = async (id) => {
    const userConfirmed = await new Promise((resolve) => {
      toast.info(
        <div>
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
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
      const response = await fetch(`${API_BASE_URL}/clients/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setClients((prevClients) =>
          prevClients.filter((client) => client.id !== id)
        );
        toast.success("¡Cliente Eliminado!");
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        await response.json();
        toast.error("Hubo un error al intentar eliminar el cliente.");
      }
    } catch (error) {
      toast.error("Ocurrió un error al intentar eliminar el cliente.");
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

      <div className="w-full overflow-x-auto">
        <table className="table-auto w-[1610px] min-w-[600px]  border-collapse rounded-md overflow-hidden shadow-md">
          <thead className="bg-lime-700/15 text-lime-900">
            <tr>
              <th className="px-5 py-2 text-center">Nombre</th>
              <th className="px-16 py-2 text-center">Ciudad</th>
              <th className="px-16 py-2 text-center">Identificación</th>
              <th className="px-16 py-2 text-center">Telefono</th>
              <th className="px-10 py-2 text-center">Dirección</th>
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
                <td colSpan="7" className="py-2 text-center">
                  Cargando...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No hay clientes disponibles.
                </td>
              </tr>
            ) : (
              clients.map((row) => (
                <tr
                  key={row.id}
                  className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                >
                  <td className="py-2 text-center">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="py-2 text-center">
                    {row.city ? row.city.name : "Sin ciudad"}
                  </td>
                  <td className="py-2 text-center">{row.identification}</td>
                  <td className="py-2 text-center">{row.phone}</td>
                  <td className="py-2 text-center">{row.address}</td>
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
      </div>

      {/* Paginator */}

      {clients.length > 0 ? (
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
                <h5 className="text-xl font-medium leading-normal  dark:text-neutral-200">
                  Editar Cliente
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
                    placeholder="Nombre"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedClient?.first_name || ""}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        first_name: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Apellido"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedClient?.last_name || ""}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex py-3">
                  <select
                    className="w-72 h-10 px-2 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedClient?.city_id || ""}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        city_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar Ciudad</option>
                    {cities.map((city) => (
                      <>
                        {city.id === selectedClient?.city_id ? (
                          <option key={city.id} value={city.id} selected>
                            {city.name}
                          </option>
                        ) : (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        )}
                      </>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="N° Nit"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedClient?.identification || ""}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        identification: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex py-3">
                  <input
                    type="text"
                    placeholder="N° Tel. Cliente"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedClient?.phone || ""}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        phone: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Dirección"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedClient?.address || ""}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        address: e.target.value,
                      })
                    }
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
    </div>
  );
}

export default TableClient;
