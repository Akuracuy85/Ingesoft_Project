// src/components/client/Body/CompraEntradas/DatosCompra/FormularioDatosCompra.tsx

import React from 'react';
import type { SummaryItem } from "../Tickets/SelectionSummaryTable";
import { GenericService } from '@/services/GenericService';
import { useLocation } from 'react-router-dom';
import type { Event } from '@/models/Event';

const DNI_LENGTH = 8;

interface Attendee {
  id: string;
  zona: string;
  label: string;
}

interface FormularioDatosCompraProps {
  handleSubmit: (e: React.FormEvent) => void;
  handleDniChange: (id: string, value: string) => void;
  handleConadisChange: (id: string, value: string) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setUniteTermsAccepted: (accepted: boolean) => void;
  allAttendees: Attendee[];
  conadisAttendees: Attendee[];
  summaryItems: SummaryItem[];
  dniValues: Record<string, string>;
  dniErrors: Record<string, string>;
  duplicateDnis: Set<string>;
  conadisCodes: Record<string, string>;
  termsAccepted: boolean;
  uniteTermsAccepted: boolean;
  isLoading: boolean;
  isUsingPoints: boolean;
}

export const FormularioDatosCompra: React.FC<FormularioDatosCompraProps> = ({
  handleSubmit,
  handleDniChange,
  handleConadisChange,
  setTermsAccepted,
  setUniteTermsAccepted,
  allAttendees,
  conadisAttendees,
  summaryItems,
  dniValues,
  dniErrors,
  duplicateDnis,
  conadisCodes,
  termsAccepted,
  uniteTermsAccepted,
  isLoading,
  isUsingPoints
}) => {

  const location = useLocation();
  const evento = location.state.evento as Event;

  return (
    <form onSubmit={handleSubmit} className="flex-1">

      {/* --- Sección 1: DNI de Asistentes --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
          ① Identificación de Asistentes
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-300 mb-4">
          Coloque los números de identificación (DNI de 8 dígitos) de las personas que asistirán al evento:
        </p>

        <div className="space-y-4">
          {summaryItems.map(zoneItem => (
            <div key={zoneItem.zona}>
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b pb-1 capitalize">
                {zoneItem.zona.toLowerCase()}
              </h4>
              <div className="space-y-3 pl-2">
                {allAttendees.filter(att => att.zona === zoneItem.zona).map(attendee => {
                  const hasError = !!dniErrors[attendee.id];
                  const isDuplicate = duplicateDnis.has(dniValues[attendee.id]) && dniValues[attendee.id]?.length === DNI_LENGTH;

                  return (
                    <div key={attendee.id}>
                      <label htmlFor={`dni-${attendee.id}`} className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                        {attendee.label}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={DNI_LENGTH}
                        id={`dni-${attendee.id}`}
                        value={dniValues[attendee.id] || ""}
                        onChange={(e) => handleDniChange(attendee.id, e.target.value)}
                        placeholder={`Ingrese DNI de ${DNI_LENGTH} dígitos`}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none
                          ${hasError || isDuplicate ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500' : 'border-gray-300 focus:ring-yellow-700 focus:border-yellow-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'}`}
                        required
                      />
                      {hasError && <p className="mt-1 text-sm text-red-600">{dniErrors[attendee.id]}</p>}
                      {!hasError && isDuplicate && <p className="mt-1 text-sm text-orange-600">Este DNI está repetido.</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Sección 2: Códigos CONADIS --- */}
      {conadisAttendees.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            ② Identificación de asistentes con CONADIS
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Coloque los códigos de CONADIS de las personas que asistirán al evento:
          </p>
          <div className="space-y-3">
            {conadisAttendees.map(attendee => (
              <div key={attendee.id}>
                <label htmlFor={`conadis-${attendee.id}`} className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                  {attendee.label}
                </label>
                <input
                  type="text"
                  id={`conadis-${attendee.id}`}
                  value={conadisCodes[attendee.id] || ""}
                  onChange={(e) => handleConadisChange(attendee.id, e.target.value)}
                  placeholder="Ingrese código"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-700 focus:border-yellow-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Checkbox y Botón --- */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col items-left h-15 justify-between">
          <div className='flex items-center'>
            <input
              id="unite_terms"
              name="unite_terms"
              type="checkbox"
              checked={uniteTermsAccepted}
              onChange={(e) => setUniteTermsAccepted(e.target.checked)}
              className="h-4 w-4 text-yellow-700 border-gray-300 rounded focus:ring-yellow-600 dark:border-gray-600"
              />
            <label htmlFor="unite_terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Declaro que he leído y acepto los <a  href={GenericService.TYC_LINK} target="_blank" rel="noopener noreferrer" className='text-[#D08700]'>términos y condiciones de Unite</a>.
            </label>
          </div>
          {
            evento.terminosUso &&
            <div className='flex items-center'>
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 text-yellow-700 border-gray-300 rounded focus:ring-yellow-600 dark:border-gray-600"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Declaro que he leído y acepto los <a  href={evento.terminosUso.url} target="_blank" rel="noopener noreferrer" className='text-[#D08700]'>términos y condiciones del evento</a>.
              </label>
            </div>

          }
        </div>
        <button
          type="submit"
          disabled={(!uniteTermsAccepted || (evento.terminosUso && !termsAccepted)) || isLoading || Object.keys(dniErrors).length > 0}
          className="w-full bg-yellow-700 text-white px-6 py-3 rounded-lg shadow font-semibold hover:bg-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {isLoading ? "Procesando la Orden..." : `Confirmar Compra (${isUsingPoints ? 'Gastar Puntos' : 'Acumular Puntos'})`}
        </button>
      </div>

    </form>
  );
};
