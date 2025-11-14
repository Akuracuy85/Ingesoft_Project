import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { AppDataSource } from "./database/data-source";

import "./jobs/colaJob";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Running on port ${PORT} ...`)
    });

  })
  .catch((err) => {
    console.error("❌ Error initializing data source:", err);
  });
