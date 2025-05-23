import React from "react";
import { useNavigate } from "react-router-dom";

function NavigationLinks() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center gap-4 p-4  border-b-2 border-b-lime-800 rounded-md ">
      <button
        onClick={handleGoBack}
        className="text-lime-800 hover:text-lime-600 font-semibold flex items-center"
      >
        <img
          src="/images/icons/arrow-left.png"
          alt="Atrás"
          className="h-5 w-5 mr-2"
        />
        Atrás
      </button>
      <span className="text-lime-800 font-semibold">/</span>
      <a
        href="/"
        className="text-lime-800 hover:text-lime-600 font-semibold flex items-center"
      >
        <img
          src="/images/icons/home.png"
          alt="Home"
          className="h-5 w-5 mr-2"
        />
        Home
      </a>
    </div>
  );
}

export default NavigationLinks;
