import ClientLayout from "./ClientLayout"; 
import { BodySeleccionEventos } from "../../components/client/Body/SeleccionEventos/BodySeleccionEventos"; 
import { useEventos } from "../../hooks/useEventos"; 

export const SeleccionDeEventos = () => {

  const { 
    events, 
    featuredEvents, 
    isLoading, 
    error, 
    filters,
    fetchEvents // La función clave para recargar
  } = useEventos(); 

  return (
    // PASA fetchEvents AL CLIENTLAYOUT PARA QUE EL HEADER LO USE
    <ClientLayout 
        showFilterButton={true}
        onApplyNewFilters={fetchEvents}
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