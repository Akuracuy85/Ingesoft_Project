import { Column, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";
import { Rol } from "../enums/Rol";

@Entity()
export class Usuario {
    
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    dni: string;
    @Column()
    email: string;
    @Column()
    nombre: string;
    @Column()
    apellidoPaterno: string;
    @Column()
    apellidoMaterno: string;
    @Column()
    celular: string;
    @Column()
    passwordHash: string;
    @Column({ type: "enum", enum: Rol, default: Rol.CLIENTE})
    rol: Rol;
    @Column()
    activo: boolean;

    activar() {
        this.activo = true;
    }

    desactivar() {
        this.activo = false;
    }
}