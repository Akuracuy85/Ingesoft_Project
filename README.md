# Unite - Sistema de Gestión de Eventos y Venta de Entradas

Este proyecto es una aplicación web completa para la gestión de eventos y venta de entradas, desarrollada como parte del curso de Ingeniería de Software (Ingesoft) en la PUCP.

## 📋 Descripción

El sistema permite a los usuarios navegar por eventos, comprar entradas, y a los organizadores gestionar sus eventos. Incluye funcionalidades como autenticación de usuarios, gestión de roles (Administrador, Organizador, Cliente), generación de entradas en PDF, colas virtuales para eventos de alta demanda, y notificaciones por correo electrónico.

## 🛠️ Tecnologías Utilizadas

### Backend
-   **Lenguaje:** TypeScript
-   **Framework:** Express.js
-   **Base de Datos:** MySQL
-   **ORM:** TypeORM
-   **Autenticación:** JWT (JSON Web Tokens) & Bcrypt
-   **Almacenamiento:** AWS S3 (para imágenes y archivos)
-   **Email:** Nodemailer
-   **PDF:** PDFMake
-   **Tareas Programadas:** Node-cron

### Frontend
-   **Lenguaje:** TypeScript
-   **Framework:** React
-   **Build Tool:** Vite
-   **Estilos:** Tailwind CSS, Flowbite
-   **Estado & Fetching:** React Query (@tanstack/react-query), Axios
-   **Enrutamiento:** React Router DOM
-   **Componentes UI:** Radix UI, Lucide React

## 📂 Estructura del Proyecto

```
Ingesoft_Project/
├── backend/            # Código fuente del servidor (API)
│   ├── src/
│   │   ├── controllers/ # Controladores de la API
│   │   ├── models/      # Entidades de la base de datos
│   │   ├── routes/      # Definición de rutas
│   │   ├── services/    # Lógica de negocio
│   │   └── ...
│   └── ...
├── frontend/           # Código fuente del cliente (Web)
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Vistas de la aplicación
│   │   ├── services/    # Servicios para conectar con el backend
│   │   └── ...
│   └── ...
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
-   Node.js (v18 o superior recomendado)
-   MySQL Server
-   Git

### 1. Configuración del Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz de `backend/` basándote en las variables necesarias (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, AWS_KEYS, etc.).
4.  Inicia el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```
    El servidor correrá generalmente en `http://localhost:3000` (o el puerto configurado).

### 2. Configuración del Frontend

1.  Navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz de `frontend/` si es necesario para configurar la URL del backend (VITE_API_URL).
4.  Inicia la aplicación en modo desarrollo:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## 👥 Contribución

Este proyecto ha sido desarrollado por el equipo del curso de Ingesoft.

## 📄 Licencia

Este proyecto es de uso académico.