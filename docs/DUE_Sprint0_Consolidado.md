# Documento Único de Entrega (DUE) — Sprint 0: Fundamentación UX y Base Técnica End-to-End

**Proyecto:** StudyRoom — Salón de Estudio Colaborativo en Tiempo Real  
**Organización en GitHub:** https://github.com/MINIPRO2  
**Historias del Sprint 0:** `TS-00` (Base Técnica End-to-End) · `TS-04` (Auditoría y Configuración de Accesibilidad Base Frontend)

### Integrantes del Equipo y Roles en el Sprint 0
| Integrante | Usuario GitHub | Rol en el Sprint 0 |
| :--- | :--- | :--- |
| `[Nombre Integrante 1]` | `@...` | Coordinación y DevOps (GitHub / Vercel / Render) |
| `[Nombre Integrante 2]` | `@...` | UX / UI Lead (Investigación, Flujos, Guía Visual y Prototipo) |
| `[Nombre Integrante 3]` | `@...` | Frontend Lead (React + TypeScript + Tailwind + Rutas) |
| `[Nombre Integrante 4]` | `@...` | Backend Lead (API REST en 3 capas + Firestore + Docker + Swagger) |
| `[Nombre Integrante 5]` | `@...` | QA y Accesibilidad Lead (Estrategia WCAG 2.2 AA + Plan de Pruebas) |

---

## Criterio `S0-C01` (10 %): Usuarios y Flujos (Personas, Problemas y Recorridos de T1 a T4)

### 1.1 Resumen de la Encuesta Corta y Entrevistas a Estudiantes Reales
Para fundamentar los perfiles de usuario en datos reales, se aplicó una **encuesta corta a 12 estudiantes universitarios** y **3 entrevistas semiestructuradas** sobre sus hábitos de estudio grupal remoto:

1. **Entrevista 1 — Estudiante de 6.º semestre de Ingeniería de Sistemas con ceguera total (usuario de NVDA):**
   - *Cómo estudia en grupo:* Se conecta por voz con 2 o 3 compañeros para repasar algoritmos y preparar entregas.
   - *Qué le molesta de las herramientas actuales (Discord, Meet, Zoom):* Exceso de botones de solo ícono sin nombre accesible («botón sin nombre»), paneles flotantes que cambian de orden, pérdida del foco del teclado al abrir el chat y ausencia de anuncios por voz (`aria-live`) cuando alguien entra, silencia su micrófono o comparte pantalla.
2. **Entrevista 2 — Monitor académico de Cálculo y Estructuras de Datos:**
   - *Cómo estudia en grupo:* Organiza sesiones de 3 a 6 estudiantes donde resuelve ejercicios compartiendo pantalla y enviando enlaces y fórmulas por el chat.
   - *Qué le molesta de las herramientas actuales:* En Google Meet o Zoom, **cuando termina la llamada se borra todo el historial del chat** con los apuntes de la sesión; además, herramientas como Microsoft Teams consumen demasiada memoria RAM.
3. **Entrevista 3 — Estudiante de 4.º semestre con conexión doméstica inestable:**
   - *Cómo estudia en grupo:* Alterna entre voz y chat de texto cuando cae su ancho de banda.
   - *Qué le molesta de las herramientas actuales:* Mensajes de error confusos que no ofrecen un botón claro de reconexión ni permiten seguir usando el chat si falla la cámara.
4. **Resultados cuantitativos de la encuesta ($n = 12$):**
   - **83,3 %** prefiere autenticarse con Google o correo institucional sin captchas visuales complejos.
   - **91,7 %** considera indispensable que el **historial del Chat persista en la base de datos** al volver a abrir la Sala.
   - **75,0 %** combina **voz + pantalla compartida + chat** en una misma sesión de estudio.

---

### 1.2 User Personas (Perfiles de Usuario)

#### Persona 1: Valentina Ríos — Estudiante Universitaria con Ceguera Total
- **Edad:** 21 años | **Programa:** Ingeniería de Sistemas (6.º semestre)
- **Tecnología de asistencia:** Lector de pantalla **NVDA** en Windows y navegación exclusiva por **teclado** (`Tab`, `Shift+Tab`, `Enter`, `Espacio`, atajos de regiones `D` y encabezados `H`).
- **Qué necesita:**
  - Iniciar sesión sin pruebas cognitivas ni captchas visuales (`WCAG 3.3.8`).
  - Entrar de forma autónoma a una **Sala** desde el **Panel** y navegar entre regiones claramente marcadas (`<header>`, `<nav>`, `<main>`, `<footer>`).
  - Enviar y escuchar mensajes del **Chat** sin perder el foco del teclado, y recibir confirmación auditiva al activar/silenciar su micrófono o compartir pantalla.
- **Qué le molesta de las herramientas actuales:**
  - Controles sin etiqueta (`aria-label`), alertas visuales que no son leídas por NVDA y trampas de foco en ventanas emergentes.

#### Persona 2: Mateo Gómez — Estudiante que Lidera Grupos de Estudio
- **Edad:** 22 años | **Programa:** Matemáticas Aplicadas e Ingeniería
- **Contexto de uso:** Portátil y celular; lidera grupos de estudio de 3 a 6 compañeros antes de cada parcial.
- **Qué necesita:**
  - Crear, editar y eliminar **Salas** privadas por materia y compartir el código de acceso rápidamente.
  - Compartir su pantalla en vivo con baja latencia mientras explica ejercicios y conservar el historial del **Chat** guardado en Firestore para repasar después.
- **Qué le molesta de las herramientas actuales:**
  - Perder los apuntes del chat al finalizar la llamada y no saber con claridad quién tiene el micrófono o la cámara encendida.

---

### 1.3 Flujos de Usuario de las Tareas Núcleo (T1 a T4) Incluyendo Manejo de Errores

- **Enlace al tablero de flujos (FigJam / Figma):** `[PEGAR AQUÍ ENLACE A FIGJAM / FIGMA DE LOS FLUJOS]`

#### Tarea T1: Gestión de Identidad, Perfil y Salas (Registrarse, Entrar, Crear/Unirse a Sala y Salir)
1. **Camino ideal:** El estudiante accede a **Ingreso (`/ingreso`)** o **Registro (`/registro`)** $\rightarrow$ inicia sesión con Google o correo institucional $\rightarrow$ la API verifica el token con Firebase Admin SDK $\rightarrow$ entra al **Panel (`/panel`)** $\rightarrow$ crea una **Sala** nueva o ingresa el código de una **Sala** existente $\rightarrow$ al finalizar pulsa **«Salir de la Sala»** o edita/elimina su **Perfil (`/perfil`)**.
2. **Qué pasa cuando algo sale mal (Manejo de errores):**
   - *Credenciales inválidas:* El formulario marca los campos en rojo (`#EF4444` + `aria-invalid="true"`) y anuncia en un `role="alert"`: *«Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo»*.
   - *Nombre de usuario ya registrado:* La transacción en Firestore rechaza el duplicado (`409 Conflict`) e indica elegir otro nombre de usuario.
   - *Código de Sala inexistente:* La API responde `404 Not Found` y el **Panel** informa: *«No existe una Sala con ese código. Verifica el código con tu compañero»*.

#### Tarea T2: Chat en Tiempo Real e Historial Persistente
1. **Camino ideal:** Al entrar a la **Sala (`/sala`)**, el frontend consulta a la API (`GET /api/rooms/:id/messages`) el historial almacenado en Cloud Firestore y lo muestra en orden cronológico. Al enviar un mensaje nuevo, se transmite por Socket.IO (`chat:message`), se guarda en Firestore y se emite a los integrantes de la misma **Sala**, anunciándose mediante `aria-live="polite"`.
2. **Qué pasa cuando algo sale mal:**
   - *Mensaje vacío:* Se impide el envío de cadenas vacías o de solo espacios.
   - *Corte temporal de conexión WebSocket:* Se muestra un aviso accesible (*«Reconectando al Chat...»*) con reconexión automática sin perder el historial previo.

#### Tarea T3: Interacción Audio y Video (WebRTC)
1. **Camino ideal:** Dentro de la **Sala (`/sala`)**, el estudiante activa su micrófono o cámara (`getUserMedia`), el servidor Socket.IO intercambia la señalización (`webrtc:signal` con oferta/respuesta SDP y candidatos ICE vía STUN/TURN) y se establece la transmisión P2P actualizando los indicadores de estado de cada participante.
2. **Qué pasa cuando algo sale mal:**
   - *Permiso de micrófono o cámara denegado por el usuario:* La aplicación **no expulsa al estudiante de la Sala**; muestra una alerta (`role="alert"`) indicando que puede continuar participando mediante el **Chat** y escuchando a los demás.
   - *Fallo de conexión P2P:* Ofrece el botón **«Reintentar conexión de voz/video»**.

#### Tarea T4: Compartición de Pantalla (WebRTC) y Salida de la Sala
1. **Camino ideal:** El estudiante pulsa **«Compartir pantalla»** (`getDisplayMedia`), elige la ventana o pantalla completa, el flujo de video se transmite por WebRTC a todos los miembros de la **Sala** y se notifica accesiblemente (*«[Nombre] está compartiendo pantalla»*). Al pulsar **«Detener pantalla»** o **«Salir de la Sala»**, se cierran todas las pistas de media (`track.stop()`) y conexiones P2P.
2. **Qué pasa cuando algo sale mal:**
   - *El usuario cancela la ventana de selección de pantalla:* Se captura el evento sin interrumpir la llamada de voz/video activa.

---

## Criterio `S0-C02` (7 %): Organización del Producto (Mapa del Sitio, Navegación y Glosario)

### 2.1 Mapa del Sitio Completo
El producto organiza sus pantallas en tres categorías claras:

1. **Pantallas Públicas:**
   - **Inicio (`/`)**: Pantalla de inicio y verificación en vivo de la Base Técnica con Cloud Firestore (`TS-00`).
   - **Ingreso (`/ingreso`)**: Inicio de sesión con cuenta institucional o Google.
   - **Registro (`/registro`)**: Creación de nueva cuenta estudiantil.
2. **Pantallas Privadas:**
   - **Panel (`/panel`)**: Listado de Salas activas, creación de Sala e ingreso por código.
   - **Sala (`/sala`)**: Espacio de estudio colaborativo con Chat, Audio/Video y Compartir pantalla.
   - **Perfil (`/perfil`)**: Visualización, edición y eliminación de la cuenta del estudiante.
3. **Pantallas de Apoyo:**
   - **Ayuda (`/ayuda`)**: Guía de atajos de teclado y accesibilidad WCAG 2.2 Nivel AA.
   - **Página no encontrada (`/404` o cualquier ruta inexistente)**: Pantalla de error 404 con botón para regresar a **Inicio**.

### 2.2 Cómo se Navega y Cómo se Vuelve Atrás
- **Menú de navegación principal (`<nav aria-label="Navegación principal">`)**: Visible en el encabezado común (`<header>`), resalta la vista activa en color rojo primario (`#D32F2F`) y define `aria-current="page"`.
- **Retorno seguro**: Todas las pantallas secundarias y la página **404** cuentan con el botón explícito **«Volver a Inicio»** (o **«Salir de la Sala»** hacia el **Panel**), además de soporte completo para los botones *Atrás/Adelante* del navegador.

### 2.3 Lista de Nombres Consistentes (Glosario Oficial)
| Concepto | Nombre Único en StudyRoom | Términos Descartados (No se usan) |
| :--- | :--- | :--- |
| Espacio virtual de estudio | **Sala** | ~~Room~~, ~~Espacio~~, ~~Canal~~, ~~Aula~~ |
| Pantalla principal tras ingresar | **Panel** | ~~Dashboard~~, ~~Tablero~~, ~~Lobby~~ |
| Pantalla de autenticación | **Ingreso** / Acción **Iniciar sesión** | ~~Login~~, ~~Sign in~~, ~~Entrar~~ |
| Pantalla de alta de cuenta | **Registro** / Acción **Registrarse** | ~~Sign up~~, ~~Crear usuario~~ |
| Mensajería de texto | **Chat** | ~~Muro~~, ~~Feed~~, ~~Foro~~ |
| Presentar pantalla a la Sala | **Compartir pantalla** | ~~Screen share~~, ~~Proyectar~~ |
| Administración de cuenta | **Perfil** | ~~Settings~~, ~~Configuración~~ |

---

## Criterio `S0-C03` (13 %): Guía Visual del Producto y Prototipo

- **Enlace al Prototipo Navegable (Computador y Celular en Figma / Stitch):** `[PEGAR AQUÍ ENLACE DE FIGMA / STITCH]`
- **Enlace al Documento de Guía Visual en el Repositorio:** https://github.com/MINIPRO2/Frontend/blob/main/docs/02-guia-visual-y-prototipo.md

### Resumen de la Guía Visual Aplicada en StudyRoom
- **Paleta de Colores (WCAG 2.2 AA/AAA):**
  - Lienzo principal: Crema cálido `#FDFBF9` (reduce fatiga visual).
  - Contenedor de tarjeta (Ley de Gestalt — Región Común): `#FDF0EC` con borde `#F3D5CC`.
  - Texto principal: Azul pizarra profundo `#1E293B` (contraste **13.8 : 1**, nivel AAA).
  - Color primario / botones de acción (CTA): Rojo institucional `#D32F2F` con hover `#B91C1C` y texto blanco `#FFFFFF` (contraste **5.4 : 1**, nivel AA).
  - Estado de error: Borde `#EF4444`, fondo `#FEF2F2` y texto `#991B1B` (contraste **8.1 : 1**).
  - Estado de éxito: Fondo `#D1FAE5` y texto `#065F46` (*«Conectado a Firestore»*).
  - Anillo de foco de teclado: Índigo brillante `#6366F1` (`ring-2 ring-indigo-400`).
- **Tipografías (máximo 2):** `Inter / system-ui` para títulos y lectura general, y `JetBrains Mono / monospace` para códigos y rutas técnicas.
- **Componentes definidos:** Botones de mínimo `44px–48px` de alto (Ley de Fitts), campos de texto con `<label>` permanente, tarjetas de agrupación Gestalt, alertas de estado (`Cargando`, `Error con Reintentar`, `Éxito`) y ventana modal de confirmación accesible (`role="dialog"`).

`[PEGAR AQUÍ CAPTURA DEL PROTOTIPO EN COMPUTADOR Y CELULAR]`

---

## Criterio `S0-C04` (14 %): `TS-00` · Aplicación Web Publicada que Consume la API y Muestra el Dato

- **Enlace de la Aplicación Publicada en Vercel:** https://studyroomintegrador.vercel.app
- **Enlace al Video Corto (mostrando el dato, el cambio en Firestore y la recarga):** `[PEGAR AQUÍ ENLACE AL VIDEO DE DRIVE / YOUTUBE]`
- **Repositorio Frontend (con `Dockerfile`, `docker-compose.yml`, `.env.example` y `README.md`):** https://github.com/MINIPRO2/Frontend

### Verificación de Cumplimiento en Producción
1. La aplicación publicada en Vercel (`https://studyroomintegrador.vercel.app`) realiza la petición `GET https://studyroom-backend-api.onrender.com/api/sprint0/status`.
2. Muestra en pantalla el dato leído en tiempo real del documento `system_status/sprint0` en Cloud Firestore (`"Tu salón de estudio colaborativo en tiempo real"` y conteo de salas activas).
3. Implementa y visualiza los 3 estados obligatorios:
   - **Cargando:** Spinner animado con mensaje *«Cargando dato de Firestore...»*.
   - **Error:** Alerta roja (`#EF4444`) con el botón **«Reintentar»**.
   - **Éxito:** Tarjeta con insignia *«Conectado a Firestore»* y el valor actual del documento.

`[PEGAR AQUÍ CAPTURA DE https://studyroomintegrador.vercel.app MOSTRANDO EL DATO DE FIRESTORE]`

---

## Criterio `S0-C05` (8 %): Estructura Base del Frontend

- **Enlace a la Aplicación Publicada:** https://studyroomintegrador.vercel.app

### Rutas Creadas y Verificadas en Producción
- **Inicio (`/`):** https://studyroomintegrador.vercel.app/
- **Ingreso (`/ingreso`):** https://studyroomintegrador.vercel.app/ingreso
- **Registro (`/registro`):** https://studyroomintegrador.vercel.app/registro
- **Panel (`/panel`):** https://studyroomintegrador.vercel.app/panel
- **Sala (`/sala`):** https://studyroomintegrador.vercel.app/sala
- **Perfil (`/perfil`):** https://studyroomintegrador.vercel.app/perfil
- **Ayuda (`/ayuda`):** https://studyroomintegrador.vercel.app/ayuda
- **Página 404 «No encontrado» (`/no-existe`):** https://studyroomintegrador.vercel.app/no-existe

`[PEGAR AQUÍ CAPTURAS NAVEGANDO POR LAS RUTAS Y LA PÁGINA 404 EN https://studyroomintegrador.vercel.app/no-existe]`

---

## Criterio `S0-C06` (14 %): `TS-00` · API Publicada que Lee Firestore (Organizada por Capas)

- **Enlace del Endpoint de la API en Render:** https://studyroom-backend-api.onrender.com/api/sprint0/status
- **Organización por Capas en el Repositorio (`MINIPRO2/Backend`):**
  1. **Capa de Rutas (`routes/`):** https://github.com/MINIPRO2/Backend/blob/main/backend-api/src/routes/sprint0.routes.ts
  2. **Capa de Lógica de Negocio (`services/`):** https://github.com/MINIPRO2/Backend/blob/main/backend-api/src/services/sprint0.service.ts
  3. **Capa de Acceso a Datos (`repositories/`):** https://github.com/MINIPRO2/Backend/blob/main/backend-api/src/repositories/sprint0.repository.ts

`[PEGAR AQUÍ CAPTURA DEL DOCUMENTO system_status/sprint0 EN FIREBASE CONSOLE (FIRESTORE)]`

---

## Criterio `S0-C07` (8 %): Separación Frontend/Backend, Docker y Documentación Inicial

- **Enlace a Swagger UI Publicado en Render:** https://studyroom-backend-api.onrender.com/api-docs
- **Repositorio Frontend:** https://github.com/MINIPRO2/Frontend
  - `Dockerfile` Frontend: https://github.com/MINIPRO2/Frontend/blob/main/Dockerfile
  - `.env.example` Frontend: https://github.com/MINIPRO2/Frontend/blob/main/.env.example
  - `README.md` Frontend: https://github.com/MINIPRO2/Frontend/blob/main/README.md
- **Repositorio Backend:** https://github.com/MINIPRO2/Backend
  - `Dockerfile` Backend API: https://github.com/MINIPRO2/Backend/blob/main/backend-api/Dockerfile
  - `Dockerfile` Backend Realtime: https://github.com/MINIPRO2/Backend/blob/main/backend-realtime/Dockerfile
  - `docker-compose.yml`: https://github.com/MINIPRO2/Backend/blob/main/docker-compose.yml
  - `.env.example` Backend API: https://github.com/MINIPRO2/Backend/blob/main/backend-api/.env.example
  - `README.md` Backend: https://github.com/MINIPRO2/Backend/blob/main/README.md

`[PEGAR AQUÍ CAPTURA DE SWAGGER EN https://studyroom-backend-api.onrender.com/api-docs]`

---

## Criterio `S0-C08` (8 %): Plan de Pruebas, Plantillas e Informe Go / No-Go

- **Enlace al Documento Completo en el Repositorio:** https://github.com/MINIPRO2/Frontend/blob/main/docs/05-plan-pruebas-qa-y-backlog.md

### Resumen del Informe de Pruebas de la Base Técnica en Producción
- **Casos ejecutados en `https://studyroomintegrador.vercel.app` y `https://studyroom-backend-api.onrender.com`:**
  - `CP-01`: Lectura del dato de Firestore en `/` con estados *Cargando* $\rightarrow$ *Éxito* (**APROBADO**).
  - `CP-02`: Modificación del campo `message` en Firestore y actualización al recargar (**APROBADO**).
  - `CP-03`: Visualización del estado de *Error* con botón **«Reintentar»** funcional (**APROBADO**).
  - `CP-04`: Documentación y prueba del endpoint en Swagger `/api-docs` (**APROBADO**).
  - `CP-05`: Navegación por las rutas del mapa del sitio y página **404** (**APROBADO**).
  - `CP-06`: Navegación por teclado, enlace *«Saltar al contenido»* y auditoría Lighthouse $\ge 90$ (**APROBADO**).
- **Decisión del Informe Go / No-Go:** **GO (Aprobado para Producción — 6/6 casos exitosos, 0 errores en consola).**

`[PEGAR AQUÍ CAPTURA DEL ESTADO DE ERROR CON EL BOTÓN REINTENTAR Y DEL ESTADO CONECTADO EN PRODUCCIÓN]`

---

## Criterio `S0-C09` (8 %): `TS-04` · Accesibilidad Base y Estrategia WCAG 2.2

- **Enlace al Documento de Estrategia WCAG 2.2 en el Repositorio:** https://github.com/MINIPRO2/Frontend/blob/main/docs/03-estrategia-accesibilidad-wcag22.md

### Pautas Base Aplicadas y Comprobadas en `https://studyroomintegrador.vercel.app`
1. **Idioma declarado (`WCAG 3.1.1`):** `<html lang="es">` en `index.html`.
2. **Título único en cada página (`WCAG 2.4.2`):** `document.title` cambia dinámicamente en cada ruta (`Inicio | StudyRoom`, `Ingreso | StudyRoom`, `Panel | StudyRoom`, `Página no encontrada (404) | StudyRoom`, etc.).
3. **Enlace «Saltar al contenido» (`WCAG 2.4.1`):** Primer elemento enfocable al presionar `Tab`, mueve el foco directamente a `<main id="contenido-principal">`.
4. **Regiones semánticas (`WCAG 1.3.1`):** `<header>`, `<nav aria-label="Navegación principal">`, `<main>` y `<footer>`.
5. **Foco siempre visible (`WCAG 2.4.7`):** Anillo de alto contraste (`#6366F1`) en todos los enlaces y botones.
6. **Anuncios de estado para lector de pantalla (`WCAG 4.1.3`):** Uso de `role="status"` (`aria-live="polite"`) en carga/éxito y `role="alert"` (`aria-live="assertive"`) en errores.

`[PEGAR AQUÍ CAPTURA DE LIGHTHOUSE (PESTAÑA ACCESSIBILITY >= 90) SOBRE https://studyroomintegrador.vercel.app]`

---

## Criterio `S0-C10` (5 %): Equipo, Roles, Rotación (7 Sprints), Backlog y Bitácora

- **Enlace al Tablero del Backlog (Jira / Taiga / GitHub Projects):** `[PEGAR AQUÍ ENLACE AL TABLERO]`
- **Enlace al Acuerdo de Equipo, Tabla de Rotación, Backlog (`TS-00` a `TS-04` y `US-01` a `US-15`) y Bitácora:** https://github.com/MINIPRO2/Frontend/blob/main/docs/05-plan-pruebas-qa-y-backlog.md

`[PEGAR AQUÍ CAPTURA DEL TABLERO CON LAS HISTORIAS US-01 A US-15 Y TS-00 A TS-04]`

---

## Criterio `S0-C11` (5 %): Trabajo en GitHub (Ramas, Commits y Pull Requests)

- **Repositorio Frontend (`MINIPRO2/Frontend`):**
  - Pestaña **Branches**: https://github.com/MINIPRO2/Frontend/branches (`main`, `feature/TS-00-base-tecnica`, `feature/TS-04-accesibilidad-base`)
  - Pestaña **Pull Requests**: https://github.com/MINIPRO2/Frontend/pulls?q=is%3Apr
    - PR #1 (`TS-00`): https://github.com/MINIPRO2/Frontend/pull/1
    - PR #2 (`TS-04`): https://github.com/MINIPRO2/Frontend/pull/2
  - Pestaña **Contributors**: https://github.com/MINIPRO2/Frontend/graphs/contributors
- **Repositorio Backend (`MINIPRO2/Backend`):**
  - Pestaña **Branches**: https://github.com/MINIPRO2/Backend/branches (`main`, `feature/TS-00-base-tecnica`)
  - Pestaña **Pull Requests**: https://github.com/MINIPRO2/Backend/pulls?q=is%3Apr
    - PR #1 (`TS-00`): https://github.com/MINIPRO2/Backend/pull/1
  - Pestaña **Contributors**: https://github.com/MINIPRO2/Backend/graphs/contributors

`[PEGAR AQUÍ CAPTURAS DE LAS PESTAÑAS BRANCHES, PULL REQUESTS Y CONTRIBUTORS DE GITHUB]`
