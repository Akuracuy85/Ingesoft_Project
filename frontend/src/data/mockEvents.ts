import { type Event } from '../models/Event'; 

// Tus datos JSON como un array tipado de Eventos
export const MOCK_EVENTS: Event[] = [
  {
    "id": 101,
    "title": "Concierto Simulado de Rock",
    "description": "El evento más grande simulado en Lima, perfecto para probar los filtros.",
    "date": "2025-12-25",
    "time": "20:00",
    "departamento": "Lima",
    "provincia": "Lima",
    "distrito": "Miraflores",
    "place": "Anfiteatro Mock",
    "image": "/images/mock-rock-banner.jpg",
    "artist": {
      "id": 1,
      "nombre": "Banda de Prueba A"
    },
    "category": "Música",
    "zonas": [
      {
        "id": 1,
        "nombre": "General",
        "capacidad": 500,
        "cantidadComprada": 100,
        "tarifaNormal": {
          "id": 1,
          "nombre": "Precio Normal",
          "precio": 50,
          "fechaInicio": "2025-10-01T00:00:00Z",
          "fechaFin": "2025-12-24T23:59:59Z"
        }
      },
      {
        "id": 2,
        "nombre": "VIP",
        "capacidad": 100,
        "cantidadComprada": 50,
        "tarifaNormal": {
          "id": 2,
          "nombre": "Precio Normal VIP",
          "precio": 150,
          "fechaInicio": "2025-10-01T00:00:00Z",
          "fechaFin": "2025-12-24T23:59:59Z"
        }
      }
    ]
  },
  {
    "id": 102,
    "title": "Festival Electrónico",
    "description": "Una simulación de un evento futuro en Arequipa.",
    "date": "2026-02-15",
    "time": "22:00",
    "departamento": "Arequipa",
    "provincia": "Arequipa",
    "distrito": "Yanahuara",
    "place": "Plaza Simulación",
    "image": "/images/mock-electro-banner.jpg",
    "artist": {
      "id": 2,
      "nombre": "DJ Mock B"
    },
    "category": "Electrónica",
    "zonas": [
      {
        "id": 3,
        "nombre": "Única",
        "capacidad": 800,
        "cantidadComprada": 50,
        "tarifaNormal": {
          "id": 3,
          "nombre": "Precio Único",
          "precio": 85,
          "fechaInicio": "2026-01-01T00:00:00Z",
          "fechaFin": "2026-02-14T23:59:59Z"
        }
      }
    ]
  }
];