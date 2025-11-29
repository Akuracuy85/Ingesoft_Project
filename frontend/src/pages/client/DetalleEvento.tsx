import React, { useEffect } from "react";
import ClientLayout from "./ClientLayout";
import { BodyDetalleEvento } from "../../components/client/Body/SeleccionEventos/BodyDetalleEvento"; 

export const DetalleEvento: React.FC = () => {
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ClientLayout>
      <BodyDetalleEvento />
    </ClientLayout>
  );
};

export default DetalleEvento;
