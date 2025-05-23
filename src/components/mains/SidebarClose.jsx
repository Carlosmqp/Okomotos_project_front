import React from "react";

function SidebarClose({ isOpen, toggleSidebar }) {
  return (
    <>
      <div
        className={`transition-transform duration-300 transform ${
          isOpen ? "-translate-x-full" : "translate-x-0"
        }  top-0 left-0 h-full w-[115px]  rounded-md shadow-md overflow-y-auto`}
      >
        <div className="w-[115px] h-full bg-lime-100 rounded-md shadow-md overflow-y-auto">
          <div className="py-4 px-6 w-full">
            <div className="hover:bg-lime-800/10  rounded-full h-16 w-16 flex justify-center">
              <button onClick={toggleSidebar}>
                <img
                  src="/images/icons/hamburger.png"
                  className="h-12 box-shadow-image"
                  alt="Logo"
                />
              </button>
            </div>
          </div>

          <nav>
            <div className="mt-10 px-7">
              <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                  <button onClick={toggleSidebar}>
                    <img
                      src="/images/icons/home.png"
                      className="h-6 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                </div>
              </div>
              <br />

              <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                  <button onClick={toggleSidebar}>
                    <img
                      src="/images/icons/report.png"
                      className="h-7 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                </div>
              </div>
              <br />

              <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                  <button onClick={toggleSidebar}>
                    <img
                      src="/images/icons/user.png"
                      className="h-7 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                </div>
              </div>
              <br />

              <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                  <button onClick={toggleSidebar}>
                    <img
                      src="/images/icons/client.png"
                      className="h-7 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                </div>
              </div>
              <br />

              <div className="relative group">
                <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                  <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                    <button onClick={toggleSidebar}>
                      <img
                        src="/images/icons/setting.png"
                        className="h-7 box-shadow-image"
                        alt="Logo"
                      />
                    </button>
                  </div>
                </div>

                <div className=" left-0 ml-4 hidden group-hover:block border-l-2 border-lime-800 mt-2">
                  <ul className="py-2">
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                          <button onClick={toggleSidebar}>
                            <img
                              src="/images/icons/category.png"
                              className="h-7 box-shadow-image"
                              alt="Logo"
                            />
                          </button>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                          <button onClick={toggleSidebar}>
                            <img
                              src="/images/icons/taxes.png"
                              className="h-7 box-shadow-image"
                              alt="Logo"
                            />
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <br />

              <div className="relative group">
                <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                  <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                    <button onClick={toggleSidebar}>
                      <img
                        src="/images/icons/inventary.png"
                        className="h-7 box-shadow-image"
                        alt="Logo"
                      />
                    </button>
                  </div>
                </div>
                <div className=" left-0 ml-4 hidden group-hover:block border-l-2 border-lime-800 mt-2">
                  <ul className="py-2">
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                          <button onClick={toggleSidebar}>
                            <img
                              src="/images/icons/inventary2.png"
                              className="h-7 box-shadow-image"
                              alt="Logo"
                            />
                          </button>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center w-52 ml-2 hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                        <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                          <button onClick={toggleSidebar}>
                            <img
                              src="/images/icons/inventary3.png"
                              className="h-7 box-shadow-image"
                              alt="Logo"
                            />
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <br />

              <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                  <button onClick={toggleSidebar}>
                    <img
                      src="/images/icons/taxing.png"
                      className="h-7 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                </div>
              </div>
              <br />

              <div className="flex items-center hover:text-lime-800 h-10 rounded-md font-semibold text-lime-800 pl-2">
                <div className="hover:bg-lime-800/10  rounded-md h-10 w-10 flex justify-center">
                  <button onClick={toggleSidebar}>
                    <img
                      src="/images/icons/sail.png"
                      className="h-7 box-shadow-image"
                      alt="Logo"
                    />
                  </button>
                </div>
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

export default SidebarClose;
