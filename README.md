# AETHER.SECURITY - Sistema de Control de Asistencia

Este proyecto es una aplicación avanzada para el control y reporte de asistencia laboral. Implementa medidas de seguridad críticas solicitadas por el Departamento de Seguridad, integrando biometría facial y geolocalización precisa.

## 🚀 Características Principales

*   **Verificación Biométrica (SUNAT PIDE):** Integración simulada con la API de Gemini para comparar el rostro capturado en vivo contra la fotografía oficial del Registro Civil (RENIEC).
*   **Geofencing (Geolocalización):** Validación de coordenadas GPS para asegurar que el colaborador se encuentre dentro del perímetro laboral autorizado (800 metros).
*   **Panel de Administración:** Gestión de personal, historial de marcaciones, configuración de turnos y exportación de reportes en formato CSV.
*   **Interfaz Futurista:** Diseño oscuro unificado utilizando Tailwind CSS y clases semánticas (`bg-dark-bg`).

## 🛠️ Tecnologías Utilizadas

*   **React** con **TypeScript**
*   **Lucide React** (Iconografía)
*   **Tailwind CSS** (Estilos)
*   **Gemini AI API** (Procesamiento Biométrico)

## 📦 Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno en un archivo `.env` basado en `.env.example`.
4. Inicia la aplicación:
   ```bash
   npm run dev
   ```