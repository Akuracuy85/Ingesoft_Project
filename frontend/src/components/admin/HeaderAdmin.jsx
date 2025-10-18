import React from "react";
import userIcon from "../../assets/Header_UserIcon.svg";
import logo from "../../assets/Logo_Unite.svg";

export default function HeaderAdmin() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      {/* Logo y nombre */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="Unite logo" className="w-6 h-6" />
        <span className="font-semibold text-foreground"></span>
      </div>

      {/* Usuario actual */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground font-medium">Admin</span>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
          <img
            src={userIcon}
            alt="Admin avatar"
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </header>
  );
}
