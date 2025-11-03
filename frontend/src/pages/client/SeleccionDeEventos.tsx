// 1. Importa el LAYOUT (el marco)
import ClientLayout from "./ClientLayout"; 

import { BodySeleccionEventos } from "../../components/client/Body/SeleccionEventos/BodySeleccionEventos"; 



export const SeleccionDeEventos = () => {
  return (
    <ClientLayout showFilterButton={true}>
      

      <BodySeleccionEventos />

    </ClientLayout>
  );
};

// export default SeleccionDeEventos; 