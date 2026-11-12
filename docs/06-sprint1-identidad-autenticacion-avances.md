# 6. Avances Técnicos y Explicación de Cambios — Sprint 1: Identidad y Autenticación (`TS-01`, `US-01`, `US-02`, `US-03`)

Este documento registra y explica paso a paso cada cambio realizado durante el **Sprint 1** en el Frontend y en el Backend de **StudyRoom**, manteniendo la trazabilidad con la rúbrica (`S1-C01` a `S1-C12`).

---

## 1. Avance 1: Empalme de Interfaz de Login, Panel y Conservación de Base Técnica (`S1-C03`, `S1-C05`, `S1-C12`)

### 1.1 Qué se modificó
- **[frontend/tailwind.config.js](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/frontend/tailwind.config.js) y [frontend/src/index.css](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/frontend/src/index.css):**
  - Se incorporó la fuente tipográfica `DM Sans` y la paleta cálida de alto contraste definida para el Sprint 1 (`slate-950: #fffdfc` a `slate-100: #2d1d1b`, e `indigo-500: #dc2626` como acento principal).
  - Se añadieron los indicadores de foco accesibles `.login-focus` y `.button-focus` junto con el enlace `skip-link` (*«Saltar al contenido»*) para cumplir con **WCAG 2.2 AA** (`2.4.1`, `2.4.7`, `2.4.11`).
- **[frontend/src/App.tsx](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/frontend/src/App.tsx):**
  - **Vista de Login limpia (`/` y `/login`):** Se eliminó cualquier barra de navegación superior en la pantalla de autenticación para presentar únicamente el módulo de ingreso/registro centrado tal como establece el diseño del Sprint 1.
  - **Panel principal vacío (`/dashboard` — Criterio `S1-C01` y `US-03`):** Tras iniciar sesión o completar el registro, el estudiante accede a su panel privado de bienvenida con sus datos de identidad (`Nombres`, `Apellidos`, `@username`, `Correo`, `Avatar`), botón de **Cerrar sesión** y el estado vacío de sus salas de estudio (*«Aún no tienes salas registradas»*), sin mezclar funcionalidades de sprints futuros.
  - **Conservación del Estado de Conexión de Cloud Firestore (`/firestore` — Criterio `S1-C12`):** El acceso al verificador end-to-end de Firestore del Sprint 0 se trasladó al encabezado privado posterior al login (`PostLoginHeader`) exclusivamente para la cuenta administradora `juanesteban0625@gmail.com`.

---

## 2. Avance 2: Backend API en 3 Capas para Identidad y Autenticación (`TS-01` · `S1-C06` y `S1-C07`)

### 2.1 Arquitectura en 3 Capas Implementada
El servicio `backend-api` mantiene una separación estricta donde el frontend nunca consulta Cloud Firestore directamente:

1. **Configuración Firebase Admin SDK ([firebase.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/backend/backend-api/src/config/firebase.ts)):**
   - Inicializa tanto `admin.firestore()` como `admin.auth()` leyendo las credenciales desde variables de entorno (`FIREBASE_SERVICE_ACCOUNT_JSON` o variables separadas).
2. **Middleware de Verificación de Sesión ([auth.middleware.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/backend/backend-api/src/middlewares/auth.middleware.ts)):**
   - Extrae el token del encabezado `Authorization: Bearer <ID_TOKEN>` y lo verifica con `auth.verifyIdToken(idToken)`.
   - Si no se envía token o el token es inválido/expirado, responde estrictamente con código HTTP **`401 Unauthorized`** y un mensaje claro en español: *«No autorizado. Debes iniciar sesión para acceder a este recurso.»*
3. **Capa de Acceso a Datos — Repositorio ([user.repository.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/backend/backend-api/src/repositories/user.repository.ts)):**
   - Gestiona las colecciones `users/{uid}` y `usernames/{usernameLower}` en Cloud Firestore.
   - **Validación de unicidad en servidor mediante transacción atómica (`db.runTransaction`):** Antes de crear o actualizar un perfil, verifica dentro de una transacción que `usernames/{usernameLower}` y la consulta sobre `users` (`where('usernameLower', '==', usernameLower)`) no pertenezcan a otro `uid`. Si está ocupado, lanza `UsernameConflictError` impidiendo duplicados incluso ante peticiones simultáneas.
4. **Capa de Lógica de Negocio — Servicio ([user.service.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/backend/backend-api/src/services/user.service.ts)):**
   - Valida campos obligatorios (`firstName`, `lastName`, `username`, `email`, `avatar`) y reglas de formato del `username` (3 a 20 caracteres, letras, números, `.`, `-`, `_`).
   - Devuelve errores asociados al campo específico (`field: 'username' | 'firstName' | 'lastName' | 'email'`) con mensajes en lenguaje del estudiante (Heurísticas #2 y #9 de Nielsen).
5. **Capa de Controladores y Rutas ([user.routes.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/backend/backend-api/src/routes/user.routes.ts)):**
   - `GET /api/users/check-username?username=...`: Comprueba disponibilidad y formato de un `username`.
   - `GET /api/users/me` *(Privada · 401)*: Retorna el perfil en Firestore del usuario autenticado e informa si `requiresUsername` es `true`.
   - `POST /api/users/register` *(Privada · 201 / 400 / 401)*: Registra el perfil manual completo (`US-01`) tras el alta en Firebase Auth.
   - `POST /api/users/google-sync` *(Privada · 200 / 401)*: Sincroniza el acceso con Google (`US-02`) e informa `requiresUsername: true` cuando el usuario entra por primera vez y aún no ha elegido su `username`.
   - `PUT /api/users/username` *(Privada · 200 / 400 / 401)*: Guarda el `username` único obligatorio del flujo con Google (`US-02`).
6. **Documentación Swagger ([swagger.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/backend/backend-api/src/config/swagger.ts)):**
   - Se actualizó a la versión `1.1.0` agregando el esquema `bearerAuth` y documentando todos los endpoints del Sprint 1 junto con los del Sprint 0 en `/api-docs`.

---

## 3. Avance 3: Implementación Completa del Frontend (`US-01`, `US-02`, `US-03` · `S1-C04`, `S1-C05`, `S1-C09`)

### 3.1 Qué se implementó en el Frontend
- **Servicio de Autenticación y Cliente API ([firebase.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/frontend/src/services/firebase.ts), [api.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/frontend/src/services/api.ts), [auth.ts](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/frontend/src/types/auth.ts)):**
  - Integración con Firebase Authentication (`firebase/auth`) para registro manual, inicio de sesión con correo/contraseña, acceso con Google mediante ventana emergente (`signInWithPopup`), recuperación de contraseña y cierre de sesión, junto con respaldo directo contra el Backend API (`Firebase Admin SDK` + `Cloud Firestore`).
  - Separación estricta: el frontend nunca importa ni consulta `firebase/firestore` directamente; todas las lecturas, escrituras y validaciones de unicidad pasan por los endpoints REST de `backend-api`.
- **Rutas y Pantallas del Sprint 1 ([App.tsx](file:///C:/Users/juane/OneDrive/Escritorio/miniproyecto2/frontend/src/App.tsx)):**
  - **`/login` (y `/`):** Inicio de sesión manual, opción *«¿Olvidaste tu contraseña?»* y botón *«Continuar con Google»* sin barra de navegación superior. Ante credenciales inválidas muestra *«Correo o contraseña incorrectos»* en un `role="alert"` sin borrar el correo ingresado.
  - **`/register`:** Formulario de registro manual con **Nombres**, **Apellidos**, **Nombre de usuario** (con verificación de disponibilidad en vivo al salir del campo y al enviar), **Selector accesible de Avatar**, **Correo** y **Contraseña** (mínimo 8 caracteres con letras y números). Los errores aparecen junto a cada campo (`FieldErrorAlert` con `aria-invalid` y `aria-describedby`) sin borrar lo escrito.
  - **`/completar-username` (`CompleteUsernamePage`):** Pantalla obligatoria exclusiva para usuarios que ingresan por primera vez con Google (`requiresUsername: true`). Bloquea cualquier intento de navegar a `/dashboard` o `/firestore` hasta que el estudiante elija un `username` único validado en el servidor.
  - **`/dashboard` y `/firestore`:** Pantallas privadas protegidas. Sin sesión activa redirigen automáticamente a `/login`. Incluyen encabezado privado con el nombre, `@username`, correo y avatar reales del estudiante, menú desplegable con opción de **Cerrar sesión** y **panel vacío** de salas de estudio (*«Aún no tienes salas registradas»*).
  - **Visibilidad exclusiva de `/firestore`:** La pestaña **Estado Firestore** (`/firestore`) está restringida exclusivamente a la cuenta administradora `juanesteban0625@gmail.com`. Cualquier otra cuenta ve únicamente el panel principal limpio sin menciones técnicas ni referencias a sprints o historias de usuario.


