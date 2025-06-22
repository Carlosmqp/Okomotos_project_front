// pages/About.jsx
import React from "react";
import TableCategory from "../resources/TableCategory";
import { useState } from "react";
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

function Category({ onLogout = () => {} }) {
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [type, setType] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingScreen, setLoadingScreen] = useState(false);

  const resetForm = () => {
    setType("");
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    setLoadingScreen(true);

    const categoryData = {
      type: type,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/categories/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      console.log(response);
      if (response.ok) {
        await response.json();
        toast.success("¡Categoria creada exitosamente!");
        resetForm();
        setShowModalTopRight(false);
        setRefreshKey((prevKey) => prevKey + 1);
      } else if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        onLogout();
      } else {
        const error = await response.json();
        console.log(error.fields.type[0]);
        if (error.fields.type[0] === "El tipo ya ha sido tomado.") {
          toast.error("!La categoria digitiada ya Existe, porfavor verificar!");
        } else if (error.fields) {
          const [firstKey] = Object.entries(error.fields)[0];
          toast.error(`¡El campo ${getFieldName(firstKey)} es requerido!`);
        }
        console.error("Failed to create category", await response.json());
      }
      function getFieldName(field) {
        const fieldNames = {
          type: "Nombre",
        };
        return fieldNames[field] || field;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingScreen(false);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModalTopRight(false);
  };

  return (
    <div className="w-full px-3">
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
      <div className="-mt-[72px] w-full text-2xl mx-3 text-neutral-100 flex font-semibold italic text-shadow">
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Creación &nbsp;
        </h1>
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Categrias
        </h1>
      </div>
      <div className="my-20"></div>

      <div className="flex flex-col items-center">
        <div className="py-3">
          <div className="-mb-10 float-end absolute right-5 z-10">
            <button
              className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-700"
              onClick={() => setShowModalTopRight(true)}
            >
              Agregar
            </button>
          </div>
          <div className="">
            <TableCategory key={refreshKey} onLogout={onLogout} />
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
          >
            <TEModalContent>
              <TEModalHeader className="bg-lime-700/75 text-white">
                {/* <!--Modal title--> */}
                <h5 className="text-xl font-medium leading-normal dark:text-neutral-200">
                  Agregar Categoria
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
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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

export default Category;
