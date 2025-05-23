// pages/About.jsx
import React, { useEffect } from "react";
import TableClient from "../resources/TableClient";
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

function Client({ onLogout = () => {} }) {
  const [showModalTopRight, setShowModalTopRight] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [identification, setIdentification] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setCity("");
    setIdentification("");
    setPhone("");
    setAddress("");
  };

  const fetchCity = async (token) => {
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
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    fetchCity(token);
  });

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const clientData = {
      first_name: firstName,
      last_name: lastName,
      city_id: city,
      identification: identification,
      phone: phone,
      address: address,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/clients/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        await response.json();
        toast.success("¡Cliente Creado!");
        
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

        if (error.fields) {
          const [firstKey] = Object.entries(error.fields)[0];
          toast.error(`¡El campo ${getFieldName(firstKey)} es requerido!`);
        }
      }

      function getFieldName(field) {
        const fieldNames = {
          first_name: "nombre",
          last_name: "apellido",
          city_id: "Ciudad",
          identification: "identificación",
          phone: "teléfono",
          email: "correo",
        };
        return fieldNames[field] || field;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModalTopRight(false);
  };

  return (
    <div className="w-full px-3">
      <div className="-mt-[72px] w-full text-2xl mx-3 text-neutral-100 flex font-semibold italic text-shadow">
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Creación &nbsp;
        </h1>
        <h1 className="first-letter:text-4xl first-letter:font-bold first-letter:text-lime-100">
          Cliente
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
            <TableClient key={refreshKey} onLogout={onLogout} />
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
                <h5 className="text-xl font-medium leading-normal  dark:text-neutral-200">
                  Agregar Cliente
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
                <div className="flex py-3">
                  <input
                    type="text"
                    placeholder="Nombre"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Apellido"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="flex py-3">
                  <select
                    name=""
                    id=""
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-72 h-10 px-2 rounded-md border-2 border-lime-800 outline-none"
                  >
                    <option value="">Seleccionar Ciudad</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="N° Nit"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                  />
                </div>

                <div className="flex py-3">
                  <input
                    type="text"
                    placeholder="N° Tel. Cliente"
                    className="w-72 h-10 px-4 rounded-md border-2 border-lime-800 outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Dirección"
                    className="w-72 h-10 px-4 ml-3 rounded-md border-2 border-lime-800 outline-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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

export default Client;
