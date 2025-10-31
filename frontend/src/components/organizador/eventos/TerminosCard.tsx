import { FileText } from "lucide-react";

export default function TerminosCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-md">
          <FileText className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Términos y condiciones</h3>
          <p className="text-sm text-gray-500">Agrega políticas y condiciones del evento.</p>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Establece reglas de acceso, reembolsos y responsabilidades.</p>
      </div>
    </div>
  );
}

