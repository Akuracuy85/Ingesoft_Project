import cron from "node-cron";
import { ColaService } from "../services/ColaService";

const colaService = ColaService.getInstance();

cron.schedule("* * * * *", async () => {
  console.log("Ejecutando limpieza de turnos inactivos...");
  await colaService.eliminarTurnosInactivos();
});