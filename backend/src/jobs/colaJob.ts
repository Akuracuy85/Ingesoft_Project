import cron from "node-cron";
import { ColaService } from "../services/ColaService";

const colaService = ColaService.getInstance();

cron.schedule("* * * * *", async () => {
  await colaService.eliminarTurnosInactivos();
});