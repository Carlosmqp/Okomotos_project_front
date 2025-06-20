import React from "react";

function Header({ onLogout }) {

  return (
    <div className="p-4 ml-1 bg-lime-700/55 text-center rounded-md shadow-md mb-5  h-16">
      <div className="flex items-center">
        <div className="w-full flex justify-end -mt-2">
          {/* <div className="rounded-full bg-black/5 hover:bg-lime-800/25 h-12 w-12 flex justify-center mr-3">
            <button className="">
              <img
                src="/images/icons/search2.png"
                className="h-10 box-shadow-image"
                alt="Buscar"
              />
            </button>
          </div> */}

          <div className="flex justify-center rounded-full bg-black/5 hover:bg-lime-800/25 h-12 w-12">
            <button onClick={onLogout}>
              <img
                src="/images/icons/Exit-3.png"
                className="h-10 box-shadow-image"
                alt="Salir"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
