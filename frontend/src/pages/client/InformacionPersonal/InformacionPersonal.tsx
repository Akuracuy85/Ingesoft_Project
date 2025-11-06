"use client";

import ClientLayout from "../ClientLayout";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
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
import { User, Mail, CreditCard, Phone, FileText, Trash2, Plus, Star } from "lucide-react";
import { clientUserService } from "../../../services/ClientUserService";

export default function InformacionPersonal() {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    dni: "",
    phone: "",
  });

  const [savedCard, setSavedCard] = useState<{ id?: number; type: string; lastFourDigits: string } | null>(null);
  const [points, setPoints] = useState<number>(0);

  const [showSuccess, setShowSuccess] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  const USE_MOCK = false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (USE_MOCK) {
          const mockProfile = {
            name: "María González",
            email: "maria.gonzalez@email.com",
            dni: "12345678",
            phone: "+51 912 345 678",
          };
          const mockCard = {
            id: 101,
            type: "VISA",
            lastFourDigits: "4582",
          };
          const mockPoints = { totalPoints: 1250 };

          setUserInfo({
            fullName: mockProfile.name,
            email: mockProfile.email,
            dni: mockProfile.dni,
            phone: mockProfile.phone,
          });
          setSavedCard(mockCard);
          setPoints(mockPoints.totalPoints);
        } else {
          const profile = await clientUserService.getProfile();
          const pointsData = await clientUserService.getPoints();

          setUserInfo({
            fullName: profile.nombre,
            email: profile.email,
            dni: profile.dni,
            phone: profile.celular,
          });

          const firstCard = profile?.tarjetas?.[0];
          if (firstCard) {
            const last4 = String(firstCard.lastFourDigits ?? firstCard.numeroCuenta ?? "").slice(-4);
            console.log("La tarjeta es: ", firstCard);
            setSavedCard({
              id: firstCard.id,
              type: "TARJETA",
              lastFourDigits: last4,
            });
          } else {
            setSavedCard(null);
          }

          setPoints(pointsData.totalPoints || 0);
        }
      } catch (err) {
        console.error("Error al obtener información personal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      if (!USE_MOCK) {
        await clientUserService.updateProfile({
          nombre: userInfo.fullName,
          email: userInfo.email,
          dni: userInfo.dni,
          celular: userInfo.phone,
        });
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar datos:", err);
    }
  };

  const handleDeleteCard = async () => {
    try {
      if (!USE_MOCK && savedCard?.id) {
        await clientUserService.deletePaymentMethod(savedCard.id);
      }
      setSavedCard(null);
      setShowDeleteAlert(false);
    } catch (err) {
      console.error("Error al eliminar tarjeta:", err);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-screen text-gray-600">
          Cargando información personal...
        </div>
      </ClientLayout>
    );
  }

  function setShowCardModal(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <ClientLayout showFilterButton={false}>
      <div className="w-full min-h-screen bg-[#F8F8F8] px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Información personal</h1>
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
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Actualizar información personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4" /> Nombre completo
                    </Label>
                    <Input
                      id="fullName"
                      value={userInfo.fullName}
                      onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4" /> Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni" className="flex items-center gap-2 text-gray-700">
                      <FileText className="w-4 h-4" /> DNI
                    </Label>
                    <Input
                      id="dni"
                      value={userInfo.dni}
                      onChange={(e) => setUserInfo({ ...userInfo, dni: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4" /> Número de teléfono
                    </Label>
                    <Input
                      id="phone"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
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

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Tarjetas guardadas</CardTitle>
                <CardDescription>Cuentas con estas tarjetas para futuras compras.</CardDescription>
              </CardHeader>
              <CardContent>
                {savedCard ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{savedCard.type}</p>
                        <p className="text-sm text-gray-600">•••• {savedCard.lastFourDigits}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteAlert(true)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No cuenta con tarjetas</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-sm bg-gradient-to-br from-[#D59B2C] to-[#C08A25] text-white">
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

      {/* 🔹 Alerta para eliminar */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
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
