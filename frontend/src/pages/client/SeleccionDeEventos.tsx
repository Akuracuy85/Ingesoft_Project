// 1. Importa el LAYOUT (el marco)
import ClientLayout from "./ClientLayout"; // (Ajusta la ruta si es necesario)

// 2. Importa SOLO el contenido de esta página
import { BodySeleccionEventos } from "../../components/client/Body/BodySeleccionEventos"; // (Ajusta la ruta si es necesario)

// (Ya no necesitas importar Header o Footer aquí)

export const SeleccionDeEventos = () => {
  return (
    // 3. ¡Aquí está la magia!
    // Usamos el Layout y le pasamos 'showFilterButton={true}'
    <ClientLayout showFilterButton={true}>
      
      {/* El Body es el 'children' que el 
          ClientLayout pondrá en la etiqueta <main> */}
      <BodySeleccionEventos />

    </ClientLayout>
  );
};

// export default SeleccionDeEventos; // (Si es la exportación por defecto)