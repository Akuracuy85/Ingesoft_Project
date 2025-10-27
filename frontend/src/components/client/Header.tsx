import React from "react";
import LogoUnite from "../../assets/Logo_Unite.svg";
import HeaderUserIcon from "../../assets/Header_UserIcon.svg";

const Header: React.FC = () => (
  <header className="flex items-center justify-between w-full px-8 py-4 bg-white shadow">
    <img src={LogoUnite} alt="Logo Unite" className="w-44" />
    <div className="flex items-center gap-3">
      <span className="text-gray-600 font-medium">Kiwi Maldini</span>
      <img src={HeaderUserIcon} alt="User" className="w-10 h-10" />
    </div>
  </header>
);

export default Header;