// src/pages/SeleccionDeEventos.tsx (CORREGIDO Y FINAL)

import ClientLayout from "./ClientLayout"; 
import { BodySeleccionEventos } from "../../components/client/Body/SeleccionEventos/BodySeleccionEventos"; 
import { useEventos } from "../../hooks/useEventos"; // LLAMADA A USEEVENTOS AQUÍ

export const SeleccionDeEventos = () => {
  // LLAMA A useEventos Y OBTÉN TODO EL ESTADO Y LA FUNCIÓN DE RECARGA
  const { 
    events, 
    featuredEvents, 
    isLoading, 
    error, 
    filters, // Se necesita para la lógica en el Body
    fetchEvents // La función clave para recargar
  } = useEventos(); 

  return (
    // PASA fetchEvents AL CLIENTLAYOUT PARA QUE EL HEADER LO USE
    <ClientLayout 
        showFilterButton={true}
        onApplyNewFilters={fetchEvents} // Aquí se inyecta la función de recarga
    >
      
      {/* PASA TODOS LOS DATOS Y FILTROS AL BODY */}
      <BodySeleccionEventos 
        events={events}
        featuredEvents={featuredEvents} 
        isLoading={isLoading}
        error={error}
        filters={filters} 
      />

    </ClientLayout>
  );
};