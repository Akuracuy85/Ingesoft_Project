import CategoriaService from "./CategoriaService";
import ArtistaService from "./ArtistaService";
import UbicacionService from "./UbicacionService";

class MetadataService {
  // Métodos delegados — no llama al backend directamente
  getCategorias = () => CategoriaService.getCategorias();
  getArtistas = () => ArtistaService.getArtistas();
  getDepartamentos = () => UbicacionService.getDepartamentos();
  getProvincias = (departamento: string) => UbicacionService.getProvincias(departamento);
  getDistritos = (departamento: string, provincia: string) => UbicacionService.getDistritos(departamento, provincia);
}

export default new MetadataService();
