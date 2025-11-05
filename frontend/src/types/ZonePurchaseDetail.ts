// src/types/ZonePurchaseDetail.ts

import { type Tarifa } from "../models/Tarifa";

export interface ZonePurchaseDetail {
    id: number;
    nombre: string; 
    capacidad: number;
    cantidadComprada: number;
    

    tarifaNormal: Tarifa; 
    tarifaPreventa: Tarifa; 
}