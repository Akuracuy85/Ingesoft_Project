import ClientLayout from "../ClientLayout";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import NotificationService from "@/services/NotificationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { User, Mail, CreditCard, Phone, FileText, Trash2, Star } from "lucide-react";
import PerfilService from "../../../services/PerfilService";
import Loading from '@/components/common/Loading';
import { FormatearTarjeta, TipoDeTarjeta } from "@/utils/TarjetaUtils";
import type { Tarjeta } from "@/models/Tarjeta";

const soloLetras = (valor: string) =>
  /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(valor);

const emailValido = (valor: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

const soloNumeros = (valor: string) =>
  /^[0-9]*$/.test(valor);

export default function InformacionPersonal() {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    lastName: "",
    motherLastName: "",
    email: "",
    dni: "",
    phone: "",
  });

  const [savedCards, setSavedCards] = useState<Tarjeta[] | null>(null);
  const [points, setPoints] = useState<number>(0);

  const [showSuccess, setShowSuccess] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await PerfilService.getProfile();
        const pointsData = await PerfilService.getPuntos();

        setUserInfo({
          fullName: profile.nombre,
          lastName: profile.apellidoPaterno || "",
          motherLastName: profile.apellidoMaterno || "",
          email: profile.email,
          dni: profile.dni,
          phone: profile.celular,
        });

        setSavedCards(profile.tarjetas || null);
        setPoints(pointsData.totalPoints || 0);
      } catch (err) {
        console.error("Error al obtener información personal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validarAntesDeGuardar = () => {
    if (!soloLetras(userInfo.fullName)) {
       NotificationService.warning("El nombre solo debe contener letras.");
      return false;
    }
    if (!soloLetras(userInfo.lastName)) {
       NotificationService.warning("El apellido paterno solo debe contener letras.");
      return false;
    }
    if (!soloLetras(userInfo.motherLastName)) {
      NotificationService.warning("El apellido materno solo debe contener letras.");
      return false;
    }
    if (!emailValido(userInfo.email)) {
      NotificationService.warning("Correo electrónico inválido.");
      return false;
    }
    if (userInfo.dni.length !== 8) {
      NotificationService.warning("El DNI debe tener 8 dígitos.");
      return false;
    }
    if (userInfo.phone.length !== 9) {
      NotificationService.warning("El número de teléfono debe tener 9 dígitos.");
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!validarAntesDeGuardar()) return;

    try {
      await PerfilService.updateProfile({
        nombre: userInfo.fullName,
        apellidoPaterno: userInfo.lastName,
        apellidoMaterno: userInfo.motherLastName,
        email: userInfo.email,
        dni: userInfo.dni,
        celular: userInfo.phone,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar datos:", err);
    }
  };

  const handleDeleteCard = async () => {
    try {
      if (selectedCardId) {
        await PerfilService.deletePaymentMethod(selectedCardId);
      }
      setSavedCards(prevCards => prevCards?.filter(card => card.id !== selectedCardId) || null);
      setShowDeleteAlert(false);
      setSelectedCardId(null);
    } catch (err) {
      console.error("Error al eliminar tarjeta:", err);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <Loading fullScreen message={"Cargando información personal..."} />
      </ClientLayout>
    );
  }

  return (
    <ClientLayout showFilterButton={false}>
      <div className="w-full min-h-screen bg-[#F8F8F8] dark:bg-gray-900 text-gray-900 dark:text-gray-100 
px-10 lg:px-20 py-12 max-w-[1600px] mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Información personal</h1>
          <p className="text-gray-600">Administra tus datos personales y tus puntos acumulados.</p>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-green-800 font-medium">Datos actualizados correctamente.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl">Actualizar información personal</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      <User className="w-4 h-4" /> Nombre completo
                    </Label>
                    <Input
                      id="fullName"
                      value={userInfo.fullName}
                      onChange={(e) => {
                        if (soloLetras(e.target.value) || e.target.value === "") {
                          setUserInfo({ ...userInfo, fullName: e.target.value });
                        }
                      }}
                    />
                  </div>

                  {/* Apellido paterno */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      <User className="w-4 h-4" /> Apellido paterno
                    </Label>
                    <Input
                      id="lastName"
                      value={userInfo.lastName}
                      onChange={(e) => {
                        if (soloLetras(e.target.value) || e.target.value === "") {
                          setUserInfo({ ...userInfo, lastName: e.target.value });
                        }
                      }}
                    />
                  </div>

                  {/* Apellido materno */}
                  <div className="space-y-2">
                    <Label htmlFor="motherLastName" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      <User className="w-4 h-4" /> Apellido materno
                    </Label>
                    <Input
                      id="motherLastName"
                      value={userInfo.motherLastName}
                      onChange={(e) => {
                        if (soloLetras(e.target.value) || e.target.value === "") {
                          setUserInfo({ ...userInfo, motherLastName: e.target.value });
                        }
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      <Mail className="w-4 h-4" /> Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, email: e.target.value })
                      }
                    />
                  </div>

                  {/* DNI */}
                  <div className="space-y-2">
                    <Label htmlFor="dni" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      <FileText className="w-4 h-4" /> DNI
                    </Label>
                    <Input
                      id="dni"
                      maxLength={8}
                      value={userInfo.dni}
                      onChange={(e) => {
                        if (soloNumeros(e.target.value)) {
                          setUserInfo({ ...userInfo, dni: e.target.value });
                        }
                      }}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      <Phone className="w-4 h-4" /> Número de teléfono
                    </Label>
                    <Input
                      id="phone"
                      maxLength={9}
                      value={userInfo.phone}
                      onChange={(e) => {
                        if (soloNumeros(e.target.value)) {
                          setUserInfo({ ...userInfo, phone: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveChanges} className="bg-[#D59B2C] hover:bg-[#C08A25] text-white px-8">
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tarjetas guardadas */}
            <Card className="shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl">Tarjetas guardadas</CardTitle>
                <CardDescription>Cuentas con estas tarjetas para futuras compras.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-64 overflow-y-auto">
                {savedCards && savedCards.length > 0 ? (
                  savedCards.map(card => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg mb-4 dark:bg-gray-800">
                        <div
                          className={`w-12 h-8 bg-gradient-to-r rounded flex items-center justify-center ${
                            TipoDeTarjeta(card.numeroTarjeta) === "Visa"
                              ? "from-blue-500 to-blue-700"
                              : "from-red-600 to-orange-400"
                          }`}
                        >
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {TipoDeTarjeta(card.numeroTarjeta)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {FormatearTarjeta(card.numeroTarjeta)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mr-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCardId(card.id!);
                            setShowDeleteAlert(true);
                          }}
                          className="border-red-300 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No cuentas con tarjetas guardadas</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Puntos */}
          <div>
            <Card className="shadow-sm bg-gradient-to-br from-[#D59B2C] to-[#C08A25] text-white dark:text-white">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Star className="w-5 h-5" /> Puntos acumulados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <p className="text-6xl font-bold mb-2">{points.toLocaleString()}</p>
                <p className="text-lg opacity-90">puntos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de eliminar */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará tu tarjeta guardada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCard} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientLayout>
  );
}
