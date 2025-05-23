import React from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../config/apiConfig";

function Sidebar({ isOpen, toggleSidebar, onLogout }) {
  const handleVerifyToken = async (e) => {
    const token = localStorage.getItem("token");

    if (token != null) {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        e.preventDefault();
        onLogout();
      }
    }
  };

  return (
    <>
      <div
        className={`transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }  top-0 left-0 h-full w-64 text-left rounded-md shadow-md overflow-y-auto`}
      >
        <div className="w-64 h-full bg-lime-100 text-left rounded-md shadow-md overflow-y-auto">
          <div className="p-4">
            <button onClick={toggleSidebar}>
              <img
                src="/images/logo.png"
                className="h-14 ml-4 box-shadow-image"
                alt="Logo"
              />
            </button>
          </div>

          <nav>
            <div className="mt-10 px-8">
              <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <button>
                  <img
                    src="/images/icons/home.png"
                    className="h-6 mr-4 box-shadow-image"
                    alt="Logo"
                  />
                </button>
                <Link
                  to="/"
                  onClick={(e) => {
                    handleVerifyToken(e);
                  }}
                >
                  Inicio
                </Link>
              </div>
              <br />

              <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <button>
                  <img
                    src="/images/icons/report.png"
                    className="h-7 mr-4 box-shadow-image"
                    alt="Logo"
                  />
                </button>
                <Link
                  to="/reports"
                  onClick={(e) => {
                    handleVerifyToken(e);
                  }}
                >
                  Reportes
                </Link>
              </div>
              <br />

              <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <button>
                  <img
                    src="/images/icons/user.png"
                    className="h-7 mr-4 box-shadow-image"
                    alt="Logo"
                  />
                </button>
                <Link
                  to="/client"
                  onClick={(e) => {
                    handleVerifyToken(e);
                  }}
                >
                  Clientes
                </Link>
              </div>
              <br />

              <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <button>
                  <img
                    src="/images/icons/client.png"
                    className="h-7 mr-4 box-shadow-image"
                    alt="Logo"
                  />
                </button>
                <Link to="/employee">Empleados</Link>
              </div>
              <br />

              <div className="relative group">
                <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                  <button>
                    <img
                      src="/images/icons/setting.png"
                      className="h-7 mr-4 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                  <p>Parametrización</p>
                </div>

                <div className=" left-0 ml-4 hidden group-hover:block border-l-2 border-lime-800 mt-2">
                  <ul className="py-2">
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <button>
                          <img
                            src="/images/icons/category.png"
                            className="h-7 mr-4 box-shadow-image"
                            alt="Logo"
                          />
                        </button>
                        <Link
                          to="/category"
                          className="block py-2 text-lime-800 rounded-md"
                          onClick={(e) => {
                            handleVerifyToken(e);
                          }}
                        >
                          Categorias
                        </Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <button>
                          <img
                            src="/images/icons/taxes.png"
                            className="h-7 mr-4 box-shadow-image"
                            alt="Logo"
                          />
                        </button>
                        <Link
                          to="/tax"
                          className="block py-2 text-lime-800 rounded-md"
                          onClick={(e) => {
                            handleVerifyToken(e);
                          }}
                        >
                          Impuestos
                        </Link>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <br />

              <div className="relative group">
                <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                  <button>
                    <img
                      src="/images/icons/inventary.png"
                      className="h-7 mr-4 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                  <p>Inventario</p>
                </div>
                <div className=" left-0 ml-4 hidden group-hover:block border-l-2 border-lime-800 mt-2">
                  <ul className="py-2">
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <button>
                          <img
                            src="/images/icons/inventary2.png"
                            className="h-7 mr-4 box-shadow-image"
                            alt="Logo"
                          />
                        </button>
                        <Link
                          to="/inventarygeneral"
                          className="block py-2 text-lime-800 rounded-md"
                          onClick={(e) => {
                            handleVerifyToken(e);
                          }}
                        >
                          General
                        </Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <button>
                          <img
                            src="/images/icons/inventary3.png"
                            className="h-7 mr-4 box-shadow-image"
                            alt="Logo"
                          />
                        </button>
                        <Link
                          to="/inventarysamples"
                          className="block py-2 text-lime-800 rounded-md"
                          onClick={(e) => {
                            handleVerifyToken(e);
                          }}
                        >
                          Muestras
                        </Link>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <br />

              <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <button>
                  <img
                    src="/images/icons/taxing.png"
                    className="h-7 mr-4 box-shadow-image"
                    alt="Logo"
                  />
                </button>
                <Link
                  to="/bill"
                  onClick={(e) => {
                    handleVerifyToken(e);
                  }}
                >
                  Facturación
                </Link>
              </div>
              <br />

              <div className="flex items-center hover:bg-slate-600/25 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <button>
                  <img
                    src="/images/icons/sail.png"
                    className="h-7 mr-4 box-shadow-image"
                    alt="Logo"
                  />
                </button>
                <Link
                  to="/sales"
                  onClick={(e) => {
                    handleVerifyToken(e);
                  }}
                >
                  Ventas
                </Link>
              </div>
              <br />
            </div>
            <div className="px-2">
              <div className=" w-auto border border-1 border-lime-100 mt-60 mb-12"></div>
              <br />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
