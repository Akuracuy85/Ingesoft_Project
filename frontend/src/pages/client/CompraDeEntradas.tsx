// 1. Importa el LAYOUT (el marco)
import ClientLayout from "./ClientLayout"; // (Ajusta la ruta si es necesario)

// 2. Importa SOLO el contenido de esta página
import { BodyCompraEntradas } from "../../components/client/Body/CompraEntradas/BodyCompraEntradas"; // (Ajusta la ruta)

// (Ya no necesitas importar Header, types, data, etc. aquí)

export const CompraDeEntradas = () => { // O 'CompraEntradas'
  return (
    // 3. Usamos el Layout.
    // No pasamos 'showFilterButton', asumiendo que es 'false' por defecto.
    <ClientLayout>
      
      {/* El Body es el 'children' que el 
          ClientLayout pondrá en la etiqueta <main> */}
      <BodyCompraEntradas />

    </ClientLayout>
  );
};

export default CompraDeEntradas;