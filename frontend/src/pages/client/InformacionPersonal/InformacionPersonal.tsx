"use client";

import ClientLayout from "../ClientLayout";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
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
import { User, Mail, CreditCard, Calendar, Phone, FileText, Trash2, Plus, History } from "lucide-react";
import { clientUserService } from "../../../services/ClientUserService"; // ✅ tu servicio de usuario

export default function InformacionPersonal() {
  // 🔹 Datos del usuario
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    dni: "",
    birthDate: "",
    phone: "",
  });

  const [savedCard, setSavedCard] = useState<{ type: string; lastFourDigits: string } | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [pointsHistory, setPointsHistory] = useState<
    { date: string; description: string; points: number; type: string }[]
  >([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = "1"; //Cambiar Luego

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await clientUserService.getProfile(userId);
        const pointsData = await clientUserService.getPoints(userId);
        const cardData = await clientUserService.getPaymentMethod(userId);

        setUserInfo({
          fullName: profile.name,
          email: profile.email,
          dni: profile.dni,
          birthDate: profile.birthDate,
          phone: profile.phone,
        });

        setPoints(pointsData.totalPoints);
        setPointsHistory(pointsData.history);
        setSavedCard(cardData);
      } catch (err) {
        console.error("Error al obtener información personal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🟡 Guardar cambios personales
  const handleSaveChanges = async () => {
    try {
      await clientUserService.updateProfile(userId, {
        name: userInfo.fullName,
        email: userInfo.email,
        dni: userInfo.dni,
        birthDate: userInfo.birthDate,
        phone: userInfo.phone,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error al actualizar datos:", err);
    }
  };

  // 🟢 Guardar o cambiar tarjeta
  const handleSaveCard = async () => {
    const newCard = { type: "VISA", lastFourDigits: "4582" };
    try {
      await clientUserService.savePaymentMethod(userId,newCard);
      setSavedCard(newCard);
      setShowCardModal(false);
    } catch (err) {
      console.error("Error al guardar tarjeta:", err);
    }
  };

  // 🔴 Eliminar tarjeta
  const handleDeleteCard = async () => {
    try {
      await clientUserService.deletePaymentMethod(userId);
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

  return (
    <ClientLayout showFilterButton={false}>
      <div className="w-full min-h-screen bg-[#F8F8F8] px-6 py-8 max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Información personal</h1>
          <p className="text-gray-600">Actualiza tus datos y consulta tus puntos acumulados.</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-green-800 font-medium">Datos actualizados correctamente.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Actualizar información personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4" />
                      Nombre completo
                    </Label>
                    <Input
                      id="fullName"
                      value={userInfo.fullName}
                      onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni" className="flex items-center gap-2 text-gray-700">
                      <FileText className="w-4 h-4" />
                      DNI
                    </Label>
                    <Input
                      id="dni"
                      value={userInfo.dni}
                      onChange={(e) => setUserInfo({ ...userInfo, dni: e.target.value })}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      Fecha de nacimiento
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={userInfo.birthDate}
                      onChange={(e) => setUserInfo({ ...userInfo, birthDate: e.target.value })}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      Número de teléfono
                    </Label>
                    <Input
                      id="phone"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      className="border-gray-300"
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

            {/* Payment Method Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Método de pago</CardTitle>
                <CardDescription>Puedes guardar una tarjeta para futuras compras.</CardDescription>
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
                        onClick={() => setShowCardModal(true)}
                        className="border-gray-300"
                      >
                        Cambiar tarjeta
                      </Button>
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
                  <Button onClick={() => setShowCardModal(true)} className="bg-[#D59B2C] hover:bg-[#C08A25] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar tarjeta
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Points */}
          <div>
            <Card className="shadow-sm bg-gradient-to-br from-[#D59B2C] to-[#C08A25] text-white">
              <CardHeader>
                <CardTitle className="text-xl text-white">Puntos acumulados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <p className="text-6xl font-bold mb-2">{points.toLocaleString()}</p>
                  <p className="text-lg opacity-90">puntos</p>
                </div>
                <p className="text-sm opacity-90 text-center">
                  Canjea tus puntos para obtener beneficios o prioridad en colas de compra.
                </p>
                <Button
                  onClick={() => setShowPointsHistory(true)}
                  variant="outline"
                  className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <History className="w-4 h-4 mr-2" />
                  Ver historial de puntos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modales */}
      <Dialog open={showCardModal} onOpenChange={setShowCardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{savedCard ? "Cambiar tarjeta" : "Agregar tarjeta"}</DialogTitle>
            <DialogDescription>Ingresa los datos de tu tarjeta de crédito o débito.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número de tarjeta</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Fecha de expiración</Label>
                <Input id="expiry" placeholder="MM/AA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" type="password" maxLength={3} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Nombre en la tarjeta</Label>
              <Input id="cardName" placeholder="MARÍA GONZÁLEZ" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCardModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSaveCard} className="flex-1 bg-[#D59B2C] hover:bg-[#C08A25] text-white">
              Guardar tarjeta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarjeta guardada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tendrás que agregar nuevamente tu tarjeta para futuras compras.
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

      <Dialog open={showPointsHistory} onOpenChange={setShowPointsHistory}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de puntos</DialogTitle>
            <DialogDescription>Consulta todos los movimientos de tus puntos acumulados.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto py-4">
            {pointsHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.description}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
                <div className={`font-bold text-lg ${item.type === "ganancia" ? "text-green-600" : "text-red-600"}`}>
                  {item.points > 0 ? "+" : ""}
                  {item.points} pts
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="font-semibold text-gray-700">Saldo actual:</span>
            <span className="text-2xl font-bold text-[#D59B2C]">{points.toLocaleString()} pts</span>
          </div>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
}
