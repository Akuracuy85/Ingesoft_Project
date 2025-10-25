import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SeleccionDeEventos } from "./pages/client/SeleccionDeEventos"; // 👈 importa la página principal

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <SeleccionDeEventos />
      </div>
    </QueryClientProvider>
  );
}

export default App;
