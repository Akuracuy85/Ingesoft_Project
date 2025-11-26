import CategoriaService from "./CategoriaService";
import ArtistaService from "./ArtistaService";
import UbicacionService from "./UbicacionService";

class MetadataService {
  // Métodos delegados — no llama al backend directamente
  getCategorias = () => CategoriaService.getCategorias();
  getArtistas = () => ArtistaService.getArtistas();
  getDepartamentos = () => UbicacionService.getDepartamentos();
  getProvincias = (departamentoId: number) => UbicacionService.getProvincias(departamentoId);
  getDistritos = (departamentoId: number, provinciaId: number) => UbicacionService.getDistritos(departamentoId, provinciaId);
}

export default new MetadataService();
