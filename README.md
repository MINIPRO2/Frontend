# Frontend (`frontend`)

Interfaz web colaborativa construida con **React 18 + TypeScript + Vite + Tailwind CSS**, cumpliendo con **WCAG 2.2 Nivel AA** y arquitectura desacoplada.

> **Regla de Arquitectura:** El frontend **nunca** consulta Firestore directamente. Todos los datos son solicitados mediante peticiones HTTP al servicio `backend-api`.

---

## Características de Accesibilidad Base

- **Idioma declarado**: `<html lang="es">` en `index.html`.
- **Regiones Semánticas (Landmarks)**: `<header>`, `<nav aria-label="...">`, `<main id="contenido-principal">`, `<footer>`.
- **Enlace «Saltar al contenido principal»**: Primer elemento enfocable con `Tab` para omitir bloques repetitivos (WCAG 2.4.1).
- **Título Dinámico**: Actualización automática de `document.title` según la vista activa (WCAG 2.4.2).
- **Foco siempre visible**: Anillo `:focus-visible` de `3px` de alto contraste en todos los controles interactivos (WCAG 2.4.7 / 2.4.11).
- **Estados accesibles para Lectores de Pantalla**: Regiones `aria-live="polite"` y `role="alert"` para anunciar estados de carga, error y éxito del dato proveniente de Firestore (WCAG 4.1.3).

---

## Ejecución en Desarrollo

1. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Instalar dependencias y levantar servidor Vite:
   ```bash
   npm install
   npm run dev
   ```
3. Abrir `http://localhost:5173`.

---

## Despliegue en Vercel

1. Importar el repositorio de GitHub en **Vercel**.
2. Configurar **Root Directory**: `frontend`.
3. Añadir las variables de entorno:
   - `VITE_API_URL`: URL pública del servicio `backend-api` en Render (ej. `https://studyroom-backend-api.onrender.com`).
   - `VITE_REALTIME_URL`: URL pública del servicio `backend-realtime` en Render.
