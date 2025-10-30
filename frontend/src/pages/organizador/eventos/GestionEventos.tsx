import React from "react";
import OrganizadorLayout from "../OrganizadorLayout";

export default function GestionEventos(): React.ReactElement {
  return (
    <OrganizadorLayout activeItem="Gestión de eventos">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestión de eventos
          </h1>
          <p className="text-muted-foreground">
            Administra tus eventos, tarifas, términos y documentación
          </p>
        </div>
        {/* Contenido funcional por implementar: listado, filtros, creación, etc. */}
      </div>
    </OrganizadorLayout>
  );
}
