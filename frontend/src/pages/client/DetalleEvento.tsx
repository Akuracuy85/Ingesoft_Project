import React, { useEffect } from "react";
// 1. Importa el LAYOUT (el marco)
import ClientLayout from "./ClientLayout"; // (Ajusta la ruta a tu layout)

// 2. Importa SOLO el contenido de esta página
import { BodyDetalleEvento } from "../../components/client/Body/SeleccionEventos/BodyDetalleEvento"; // (Ajusta la ruta al Body)

export const DetalleEvento: React.FC = () => {
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ClientLayout>
      
      {}
      <BodyDetalleEvento />

    </ClientLayout>
  );
};

export default DetalleEvento;
