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

function TableEmployee({ onLogout = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async (token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/employees?search=${searchTerm}&page=${currentPage}&per_page=${perPage}`,
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
        setEmployee(data.data);
        setTotalPages(data.last_page);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        console.error(`Failed to fetch employees: ${response.status}`);
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

    const delayDebounceFn = setTimeout(() => {
      fetchEmployees(token);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, perPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModalTopRight(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/employees/update/${selectedEmployee.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedEmployee),
        }
      );

      if (response.ok) {
        await response.json();

        toast.success("¡Empleado Editado Exitosamente!");
        setShowModalTopRight(false);
        setSelectedEmployee(null);
        fetchEmployees(token);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        toast.error("¡Error Al Editar El Empleado!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModalTopRight(false);
    setSelectedEmployee(null);
  };

  const handleDelete = async (id) => {
    const userConfirmed = await new Promise((resolve) => {
      toast.info(
        <div>
          <p>¿Estás seguro de que deseas eliminar este empleado?</p>
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

    try {
      const response = await fetch(`${API_BASE_URL}/employees/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setEmployee((prevClients) =>
          prevClients.filter((client) => client.id !== id)
        );
        toast.success("Empleado eliminado con éxito.!");
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        await response.json();
        toast.error("¡Hubo un error al intentar eliminar el empleado.!");
      }
    } catch (error) {
      toast.error("¡Hubo un error al intentar eliminar el empleado.!");
    }
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
              <th className="px-5 py-2 text-center">Nombre</th>
              <th className="px-16 py-2 text-center">Identificación</th>
              <th className="px-16 py-2 text-center">Telefono</th>
              <th className="px-10 py-2 text-center">Correo</th>
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
            ) : (
              employee.map((row) => (
                <tr
                  key={row.id}
                  className="even:border-lime-800/55 odd:border-lime-800/55 border-b-2 hover:bg-lime-200/55"
                >
                  <td className="py-2 text-center">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="py-2 text-center">{row.identification}</td>
                  <td className="py-2 text-center">{row.phone}</td>
                  <td className="py-2 text-center">{row.email}</td>
                  <td className="py-2 text-center">
                    <button onClick={() => handleEditClick(row)}>
                      <img
                        src="/images/icons/edit.png"
                        alt="Editar"
                        className="inline h-7 box-shadow-image"
                        onClick={() => setShowModalTopRight(true)}
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
      {employee.length > 0 ? (
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
                  Editar Empleado
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
                    value={selectedEmployee?.first_name || ""}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        first_name: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Apellido"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedEmployee?.last_name || ""}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-center py-3">
                  <input
                    type="text"
                    placeholder="N° Nit"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedEmployee?.identification || ""}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        identification: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex py-3">
                  <input
                    type="text"
                    placeholder="N° Telefono"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedEmployee?.phone || ""}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        phone: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Correo"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={selectedEmployee?.email || ""}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        email: e.target.value,
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

export default TableEmployee;
