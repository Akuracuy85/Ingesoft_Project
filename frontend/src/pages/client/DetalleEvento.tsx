import React from "react";
// 1. Importa el LAYOUT (el marco)
import ClientLayout from "./ClientLayout"; // (Ajusta la ruta a tu layout)

// 2. Importa SOLO el contenido de esta página
import { BodyDetalleEvento } from "../../components/client/Body/SeleccionEventos/BodyDetalleEvento"; // (Ajusta la ruta al Body)

export const DetalleEvento: React.FC = () => {
  return (
    // 3. Usamos el Layout.
    // No pasamos 'showFilterButton', así que será 'false' (correcto)
    <ClientLayout>
      
      {/* 4. El Body es el 'children' que el 
          ClientLayout pondrá en la etiqueta <main> */}
      <BodyDetalleEvento />

    </ClientLayout>
  );
};

export default DetalleEvento;
