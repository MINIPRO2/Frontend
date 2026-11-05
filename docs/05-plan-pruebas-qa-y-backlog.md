# 5. Plan de Pruebas QA, Informe Go/No-Go, Acuerdo de Equipo, Rotación y Backlog

Documento oficial de Aseguramiento de Calidad (`S0-C08`) y Coordinación de Equipo y Backlog (`S0-C10`) para el Sprint 0 de **StudyRoom**.

---

## 1. Plan de Pruebas QA (`S0-C08`)

### 1.1 Qué se prueba en cada Sprint y en qué Navegadores
- **Alcance por Sprint:**
  1. Verificación funcional de cada criterio de aceptación (*Dado / Cuando / Entonces*) sobre la **aplicación publicada en producción (Vercel + Render)** — nunca solo en local.
  2. Pruebas de estados de interfaz: **Vacío, Cargando, Error (con botón «Reintentar») y Éxito**.
  3. Auditoría de accesibilidad: navegación 100% con teclado (`Tab`, `Shift+Tab`, `Enter`, `Espacio`), prueba con lector de pantalla (**NVDA** en Windows / **VoiceOver** en macOS) y auditoría **Lighthouse Accessibility $\ge 90$** sin errores en la consola del navegador.
  4. Pruebas de regresión de las funcionalidades entregadas en sprints anteriores.
- **Navegadores y Entornos Objetivo:**
  - **Computador:** Google Chrome (última versión estable, Windows/macOS) y Mozilla Firefox / Microsoft Edge.
  - **Celular (Responsive):** Vista móvil Chrome DevTools (`390x844` iPhone / `412x915` Android) y navegador móvil real.

### 1.2 Plantilla de Reporte de Error (Issue en GitHub — `S0-C08`)
Cuando un caso de prueba falla, el responsable de QA crea un Issue en el repositorio de GitHub (`MINIPRO2/Frontend` o `MINIPRO2/Backend`) con la siguiente plantilla:

```markdown
### [BUG] Título corto y descriptivo del fallo
- **Historia relacionada:** TS-00 / TS-04 / US-XX
- **Caso de prueba que falló:** CP-XX
- **Severidad:** Alta (Bloqueante) | Media | Baja (Cosmética)
- **Entorno y Navegador:** URL publicada en Vercel/Render • Chrome 130 (Windows 11)
- **Pasos para reproducir (Dado / Cuando):**
  1. Dado que ingreso a la URL publicada https://...
  2. Cuando presiono el botón "..."
- **Resultado esperado (Entonces):** Debería mostrarse el mensaje de error con botón «Reintentar».
- **Resultado obtenido:** La pantalla queda en blanco o arroja error en consola.
- **Evidencia adjunta:** [Captura de pantalla / Video / Log de consola]
```

---

## 2. Ejecución de Casos de Prueba de la Base Técnica e Informe Go / No-Go (`S0-C08`)

### 2.1 Matriz de Casos de Prueba Ejecutados (Sprint 0)

| ID Caso | Historia | Escenario (Dado / Cuando / Entonces) | Resultado Esperado | Resultado Obtenido | Estado | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CP-01** | `TS-00` | **Dado** que el usuario abre la ruta `/` de StudyRoom, **Cuando** la vista consulta `GET /api/sprint0/status`, **Entonces** primero muestra el estado *Cargando* y luego renderiza el campo `message` leído de Cloud Firestore (`system_status/sprint0`). | Muestra el dato real de Firestore sin errores en consola. | Muestra el dato real de `system_status/sprint0` con código HTTP `200 OK` y `0` errores en consola. | **APROBADO** | Captura de pantalla y video de la vista `/` |
| **CP-02** | `TS-00` | **Dado** que se edita el campo `message` del documento `system_status/sprint0` en Firebase Console, **Cuando** se recarga la aplicación web o se pulsa **«Recargar dato»**, **Entonces** la interfaz refleja el nuevo texto inmediatamente. | El texto actualizado en Firestore aparece en pantalla tras recargar. | El nuevo valor de `message` se actualiza en vivo al recargar la página. | **APROBADO** | Video corto mostrando el cambio en Firestore y la recarga |
| **CP-03** | `TS-00` | **Dado** que ocurre un fallo de comunicación con la API, **Cuando** se activa el estado de error, **Entonces** se presenta una alerta accesible (`role="alert"`) con el botón **«Reintentar»** que restablece el dato al pulsarse. | Alerta visible en rojo (`#EF4444`) con botón **«Reintentar»** funcional. | Se muestra el estado de error y al pulsar **«Reintentar»** vuelve a cargar el dato de Firestore. | **APROBADO** | Captura del estado de error y botón «Reintentar» |
| **CP-04** | `TS-00` | **Dado** que se accede a `/api-docs` en el Backend API, **Cuando** carga Swagger UI, **Entonces** aparece documentado el endpoint `GET /api/sprint0/status` y permite ejecutar *Try it out*. | Swagger UI público y operativo. | Swagger UI responde correctamente con el esquema del endpoint de la base técnica. | **APROBADO** | Captura de `/api-docs` |
| **CP-05** | `S0-C05` | **Dado** que el usuario navega por las rutas del mapa del sitio (`/`, `/ingreso`, `/registro`, `/panel`, `/sala`, `/perfil`, `/ayuda`, `/404`), **Cuando** cambia de ruta, **Entonces** se mantiene la estructura común (`<header>`, `<nav>`, `<main>`, `<footer>`) y cambia el `document.title`. | Todas las rutas y la página 404 cargan con la Guía Visual de StudyRoom. | Las 8 vistas cargan sin recarga brusca, con título propio y página 404 diseñada. | **APROBADO** | Capturas de navegación por las rutas y vista 404 |
| **CP-06** | `TS-04` | **Dado** que un usuario navega únicamente con la tecla `Tab` y se ejecuta Lighthouse en modo Accesibilidad, **Cuando** recorre la página, **Entonces** el primer elemento es *«Saltar al contenido»*, el foco es siempre visible y Lighthouse otorga $\ge 90$ puntos. | Foco visible en todos los controles y Lighthouse $\ge 90$. | Navegación por teclado completa, `lang="es"` declarado y puntaje Lighthouse $\ge 90$. | **APROBADO** | Captura de auditoría Lighthouse Accessibility |

### 2.2 Informe Go / No-Go del Sprint 0 (`S0-C08`)
- **Decisión de Lanzamiento:** **GO (Aprobado para Entrega en Producción)**
- **Justificación de QA:**
  - `6 de 6` casos de prueba (`100%`) aprobados satisfactoriamente.
  - `0` defectos bloqueantes o críticos abiertos.
  - `0` errores en la consola del navegador (`Console` limpia).
  - Separación por capas en el backend (`routes` $\rightarrow$ `services` $\rightarrow$ `repositories`) verificada y contenedores Docker compilando sin errores.

---

## 3. Coordinación: Acuerdo de Equipo y Rotación de Roles en los 7 Sprints (`S0-C10`)

### 3.1 Acuerdo de Equipo (`S0-C10`)
1. **Canales de Comunicación Oficiales:**
   - **WhatsApp (Grupo del equipo):** Coordinación rápida diaria y avisos urgentes (tiempo máximo de respuesta: 4 horas en horario diurno).
   - **Discord / Google Meet:** Reuniones síncronas de planificación de sprint, revisiones de código y pruebas en vivo.
   - **GitHub Organization (`MINIPRO2`) y Tablero de Proyecto:** Único canal válido para seguimiento de tareas, Pull Requests y reporte de errores.
2. **Horarios de Trabajo y Reuniones Fijas:**
   - **Sincronización de inicio de Sprint:** Lunes 7:00 p. m. – 8:00 p. m.
   - **Seguimiento intermedio:** Miércoles 8:00 p. m. – 8:30 p. m.
   - **Cierre de Pull Requests, QA y Despliegue en Vercel/Render:** Mínimo 24 horas antes de la fecha límite de entrega de cada sprint.
3. **Normas de Trabajo y Calidad en GitHub (`S0-C11`):**
   - **Prohibido hacer commits directos sobre `main`**: Toda historia técnica (`TS-XX`) o de usuario (`US-XX`) se desarrolla en su propia rama (`feature/TS-00-base-tecnica`, `feature/US-01-registro`, etc.).
   - **Mensajes de commit descriptivos (Conventional Commits):** Ej. `feat: separar backend-api en capas ruta, servicio y repositorio (TS-00)`, nunca mensajes vagos como *"cambios"* o *"final"*.
   - **Participación obligatoria:** Los 5 integrantes del equipo deben registrar commits propios y verificables en cada sprint.
   - **Integración y despliegue:** Todo Pull Request debe incluir descripción y capturas antes de ser integrado a `main` por el administrador de Vercel y Render.

### 3.2 Roles del Sprint 0 y Plan de Rotación para los 7 Sprints (Sprint 0 a Sprint 6) (`S0-C10`)

| Rol en el Equipo | Sprint 0 | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Sprint 6 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Coordinación y DevOps (GitHub / Vercel / Render)** | Integrante 1 | Integrante 2 | Integrante 3 | Integrante 4 | Integrante 5 | Integrante 1 | Integrante 2 |
| **2. UX / UI Lead (Prototipos, Guía Visual y Heurísticas)** | Integrante 2 | Integrante 3 | Integrante 4 | Integrante 5 | Integrante 1 | Integrante 2 | Integrante 3 |
| **3. Frontend Lead (React + TS + Tailwind + Rutas)** | Integrante 3 | Integrante 4 | Integrante 5 | Integrante 1 | Integrante 2 | Integrante 3 | Integrante 4 |
| **4. Backend Lead (API REST + Firestore + Socket.IO/WebRTC)** | Integrante 4 | Integrante 5 | Integrante 1 | Integrante 2 | Integrante 3 | Integrante 4 | Integrante 5 |
| **5. QA y Accesibilidad Lead (WCAG 2.2 AA + Pruebas)** | Integrante 5 | Integrante 1 | Integrante 2 | Integrante 3 | Integrante 4 | Integrante 5 | Integrante 1 |

---

## 4. Product Backlog Completo (`TS-00` a `TS-04` y `US-01` a `US-15`) (`S0-C10`)

Todas las historias incluyen sus **Criterios de Aceptación (Dado / Cuando / Entonces)**, **Prioridad**, **Responsable**, **Sprint asignado**, **Estados de gestión (Vacío, Cargando, Error, Éxito)** y **Evidencia esperada**:

| ID | Historia | Trazabilidad | Prioridad | Sprint | Responsable | Criterio de Aceptación (Dado / Cuando / Entonces) | Estados de Gestión (Vacío, Cargando, Error, Éxito) | Evidencia Esperada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TS-00** | Base Técnica End-to-End (Frontend + API + Firestore + Docker + Swagger) | Habilita `US-01` a `US-15` | Crítica (Alta) | **Sprint 0** | BE Lead / FE Lead | **Dado** que la aplicación está publicada en Vercel y Render, **Cuando** el usuario abre `/`, **Entonces** el frontend consulta la API, la API lee `system_status/sprint0` en Firestore y muestra el dato en pantalla. | **Vacío:** Documento inicial creado automáticamente. **Cargando:** Spinner *«Cargando dato desde Cloud Firestore...»*. **Error:** Alerta roja con botón *«Reintentar»*. **Éxito:** Dato de Firestore renderizado. | Enlace de Vercel, enlace de API/Swagger en Render y video mostrando el cambio en Firestore y recarga. |
| **TS-04** | Auditoría y Configuración de Accesibilidad Base Frontend (WCAG 2.2 AA) | Habilita `US-01` a `US-15` | Crítica (Alta) | **Sprint 0** | QA / FE Lead | **Dado** que un usuario con lector de pantalla o teclado entra a la app, **Cuando** navega con `Tab`, **Entonces** encuentra `lang="es"`, enlace *«Saltar al contenido»*, regiones semánticas, títulos únicos por ruta y Lighthouse $\ge 90$. | **Vacío/Cargando/Error/Éxito:** Todos los estados anunciados mediante `role="status"` o `role="alert"`. | Documento de estrategia WCAG 2.2 y captura de Lighthouse $\ge 90$ en producción. |
| **TS-01** | Configuración de Firebase Auth y Perfiles en Firestore | Habilita `US-01` a `US-05` | Alta | **Sprint 1** | BE Lead | **Dado** un usuario que se autentica con Firebase Auth, **Cuando** envía su ID Token a la API, **Entonces** la API verifica el token con Admin SDK, garantiza `username` único por transacción y bloquea rutas privadas con `401` si no hay sesión. | **Vacío:** Sin perfil previo. **Cargando:** *«Verificando sesión...»*. **Error:** Token inválido (`401`) o username duplicado (`409`). **Éxito:** Sesión y perfil activos. | PR fusionado, endpoints en Swagger y prueba de rechazo `401`. |
| **US-01** | Registro de cuenta con correo institucional y contraseña | Tarea `T1` | Alta | **Sprint 1** | FE Lead | **Dado** un estudiante sin cuenta en `/registro`, **Cuando** ingresa correo válido, username único y contraseña segura, **Entonces** se registra en Firebase Auth y se crea su perfil en Firestore. | **Vacío:** Campos limpios con placeholders. **Cargando:** Botón con spinner *«Registrando...»*. **Error:** Borde `#EF4444` y alerta descriptiva. **Éxito:** Redirección al Panel. | Capturas y flujo en producción. |
| **US-02** | Inicio de sesión rápido con Google (sin pruebas cognitivas) | Tarea `T1` (`WCAG 3.3.8`) | Alta | **Sprint 1** | FE Lead | **Dado** un estudiante en `/ingreso`, **Cuando** pulsa **«Continuar con Google»**, **Entonces** se autentica en un paso sin resolver captchas y accede al Panel. | **Vacío:** Estado inicial. **Cargando:** *«Autenticando con Google...»*. **Error:** Alerta si se cierra el popup. **Éxito:** Ingreso al Panel. | Captura de login con Google en producción. |
| **US-03** | Inicio de sesión manual y cierre de sesión seguro | Tarea `T1` | Alta | **Sprint 1** | FE Lead | **Dado** un estudiante registrado en `/ingreso`, **Cuando** envía su correo y contraseña correctos, **Entonces** accede al Panel y puede cerrar sesión limpiando su token. | **Vacío:** Formulario limpio. **Cargando:** *«Autenticando...»*. **Error:** *«Correo o contraseña incorrectos»*. **Éxito:** Acceso al Panel. | Pruebas QA de login y logout. |
| **US-04** | Ver y editar datos del Perfil de usuario | Tarea `T1` | Media | **Sprint 1** | BE / FE Lead | **Dado** un estudiante autenticado en `/perfil`, **Cuando** actualiza su nombre o carrera y guarda, **Entonces** la API actualiza Firestore y muestra confirmación. | **Vacío:** Sin biografía opcional. **Cargando:** *«Guardando cambios...»*. **Error:** Alerta de validación. **Éxito:** Mensaje *«Perfil actualizado»*. | Captura de edición reflejada en Firestore. |
| **US-05** | Eliminación de cuenta propia con confirmación | Tarea `T1` | Media | **Sprint 1** | BE / FE Lead | **Dado** un estudiante en `/perfil`, **Cuando** confirma en la ventana modal la eliminación de su cuenta, **Entonces** la API borra su perfil en Firestore y su usuario en Firebase Auth. | **Vacío:** Modal cerrado. **Cargando:** *«Eliminando cuenta...»*. **Error:** Reintento si falla red. **Éxito:** Cuenta eliminada y redirección a `/ingreso`. | Video/captura de ventana de confirmación y borrado. |
| **TS-02** | Infraestructura de WebSockets (Socket.IO) y Modelado de Salas/Chat | Habilita `US-06` a `US-11` | Crítica (Alta) | **Sprint 2** | BE Lead | **Dado** el servicio `backend-realtime` en Render con Docker, **Cuando** un cliente se conecta con su ID Token en el handshake, **Entonces** se une al room de Socket.IO y sincroniza eventos de Sala y Chat. | **Vacío:** Sala sin mensajes. **Cargando:** *«Conectando en tiempo real...»*. **Error:** Handshake rechazado sin token. **Éxito:** Socket conectado. | Servicio `backend-realtime` publicado en Render y logs de conexión. |
| **US-06** | Crear Sala de estudio privada | Tarea `T1` | Alta | **Sprint 2** | FE / BE Lead | **Dado** un estudiante en `/panel`, **Cuando** completa el nombre y materia de la Sala, **Entonces** la API guarda la Sala en Firestore con un código único. | **Vacío:** Lista de Salas vacía con invitación a crear la primera. **Cargando:** *«Creando Sala...»*. **Error:** Campos obligatorios faltantes. **Éxito:** Sala creada en el Panel. | Captura de creación de Sala en producción. |
| **US-07** | Editar y eliminar Sala de estudio (solo creador) | Tarea `T1` | Media | **Sprint 2** | FE / BE Lead | **Dado** el creador de una Sala en `/panel`, **Cuando** edita el título o confirma eliminar la Sala en el modal, **Entonces** la API verifica autoría y actualiza/elimina el documento en Firestore. | **Vacío:** Sala eliminada desaparece de la lista. **Cargando:** *«Actualizando Sala...»*. **Error:** `403 Forbidden` si no es el creador. **Éxito:** Cambios aplicados. | Captura de edición y modal de eliminación. |
| **US-08** | Unirse y salir de una Sala mediante código o listado | Tarea `T1` | Alta | **Sprint 2** | FE Lead | **Dado** un estudiante en `/panel`, **Cuando** ingresa el código de una Sala existente, **Entonces** entra a `/sala` y se registra en la lista de participantes activos. | **Vacío:** Campo de código limpio. **Cargando:** *«Ingresando a la Sala...»*. **Error:** *«No existe una Sala con ese código»*. **Éxito:** Ingreso a la Sala. | Prueba de ingreso con 2 usuarios. |
| **US-10** | Enviar y recibir mensajes de Chat en tiempo real | Tarea `T2` | Alta | **Sprint 3** | FE / BE Lead | **Dado** dos o más estudiantes dentro de la misma Sala, **Cuando** uno envía un mensaje en el Chat, **Entonces** aparece al instante en las pantallas de la misma Sala vía Socket.IO y se anuncia por `aria-live="polite"`. | **Vacío:** *«Aún no hay mensajes en esta Sala. ¡Escribe el primero!»*. **Cargando:** Indicador de envío. **Error:** Aviso de desconexión con reconexión. **Éxito:** Mensaje entregado. | Video con 2 navegadores chateando en tiempo real. |
| **US-11** | Persistencia y carga del historial del Chat desde Firestore | Tarea `T2` | Alta | **Sprint 3** | BE / FE Lead | **Dado** que una Sala tiene mensajes previos guardados en Firestore, **Cuando** un estudiante entra o recarga la Sala, **Entonces** la API devuelve el historial ordenado y el frontend lo muestra. | **Vacío:** Sin historial previo. **Cargando:** *«Cargando historial del Chat...»*. **Error:** Botón *«Reintentar carga de mensajes»*. **Éxito:** Historial completo visible. | Recarga de página mostrando que los mensajes persisten. |
| **TS-03** | Implementación de Lógica WebRTC (Signaling Server + STUN/TURN) | Habilita `US-09`, `US-12` a `US-14` | Crítica (Alta) | **Sprint 4** | BE Lead | **Dado** dos navegadores en distintos dispositivos dentro de una Sala, **Cuando** intercambian ofertas SDP y candidatos ICE por Socket.IO usando STUN/TURN en variables de entorno, **Entonces** establecen conexión P2P estable y cierran pistas al salir. | **Vacío:** Sin pares remotos aún. **Cargando:** *«Estableciendo conexión de voz y video...»*. **Error:** Fallo ICE con botón de reconexión. **Éxito:** Flujo P2P activo. | Prueba de conexión P2P entre 2 dispositivos. |
| **US-09** | Visualización de estados de usuarios conectados en la Sala | Tarea `T3` | Alta | **Sprint 4** | FE Lead | **Dado** un estudiante en `/sala`, **Cuando** otro compañero entra, sale o cambia su micrófono/cámara, **Entonces** la lista de participantes actualiza su estado visual y accesible al instante. | **Vacío:** *«Eres el único participante en la Sala»*. **Cargando:** Actualizando lista. **Error:** Desconexión notificada. **Éxito:** Estados visibles por participante. | Captura de indicadores de presencia y audio/video. |
| **US-12** | Transmisión de audio en tiempo real y control Mute/Unmute | Tarea `T3` | Alta | **Sprint 4** | FE Lead | **Dado** un estudiante en `/sala`, **Cuando** pulsa el botón de micrófono (`aria-pressed`), **Entonces** transmite o silencia su voz por WebRTC con retroalimentación clara. | **Vacío:** Micrófono apagado al entrar. **Cargando:** Solicitando permiso de micrófono. **Error:** Permiso denegado (permite seguir en Chat). **Éxito:** Audio transmitiendo. | Video de prueba de voz y mute/unmute por teclado. |
| **US-13** | Videollamada en tiempo real y control de cámara | Tarea `T3` | Alta | **Sprint 4** | FE Lead | **Dado** un estudiante en `/sala`, **Cuando** activa su cámara, **Entonces** su video se muestra en la cuadrícula de la Sala para todos los participantes conectados. | **Vacío:** Avatar con iniciales cuando la cámara está apagada. **Cargando:** Iniciando cámara. **Error:** Sin cámara disponible. **Éxito:** Video en vivo. | Video de llamada multipunto en producción. |
| **US-14** | Compartición de pantalla en tiempo real | Tarea `T4` | Alta | **Sprint 5** | FE Lead | **Dado** un estudiante en `/sala`, **Cuando** pulsa **«Compartir pantalla»** y elige una ventana, **Entonces** todos los miembros de la Sala ven su pantalla vía WebRTC y reciben el anuncio accesible. | **Vacío:** Ninguna pantalla compartida. **Cargando:** Seleccionando ventana. **Error:** Cancelación del selector manejada sin romper la llamada. **Éxito:** Pantalla compartida activa. | Video compartiendo pantalla entre 2 usuarios y evaluación heurística (Sprint 5). |
| **US-15** | Validación integral de Accesibilidad WCAG 2.2 AA y Pruebas de Usabilidad (4 usuarios) | Transversal `T1`–`T4` | Crítica (Alta) | **Sprint 6** | Todo el equipo | **Dado** el producto completo publicado, **Cuando** se evalúa con teclado, NVDA/VoiceOver, Lighthouse ($\ge 95$) y 4 participantes externos (thinking aloud + SEQ + SUS + consentimiento Ley 1581), **Entonces** todas las tareas `T1`–`T4` se completan sin barreras y se corrigen los hallazgos graves. | **Vacío/Cargando/Error/Éxito:** Verificados en el 100% de las pantallas del producto final. | Grabaciones sin cortes de las 4 sesiones, consentimientos firmados, métricas SEQ/SUS y Lighthouse $\ge 95$. |

---

## 5. Bitácora y Retrospectiva del Sprint 0 (`S0-C10`)

### 5.1 Bitácora de Actividades del Sprint 0
| Fecha | Actividad Realizada | Participantes | Resultado / Entregable Generado |
| :--- | :--- | :--- | :--- |
| **Sesión 1** | Definición del problema, aplicación de encuesta corta (12 estudiantes), 3 entrevistas y construcción de las Personas Valentina y Mateo. | Todo el equipo (Lidera UX Lead) | Sección 1 y 2 de `01-ux-personas-flujos-mapa.md`. |
| **Sesión 2** | Diseño del Mapa del Sitio, Glosario oficial de nombres consistentes, flujos `T1`–`T4` con manejo de errores, Guía Visual de **StudyRoom** y prototipo. | UX Lead + FE Lead | `01-ux-personas-flujos-mapa.md` y `02-guia-visual-y-prototipo.md`. |
| **Sesión 3** | Creación de la arquitectura separada (`frontend`, `backend-api` en 3 capas: rutas, servicios y repositorios, `backend-realtime`), conexión a Cloud Firestore, Swagger y Dockerfiles. | BE Lead + Coordinación | Servicios contenerizados y endpoint `GET /api/sprint0/status` conectado a Firestore (`TS-00`). |
| **Sesión 4** | Implementación de la estructura base del frontend con todas las rutas del mapa del sitio, vista 404, estados de carga/error/éxito de Firestore y accesibilidad base (`TS-04`). | FE Lead + QA Lead | Frontend con rutas, botón «Reintentar» y estrategia `03-estrategia-accesibilidad-wcag22.md`. |
| **Sesión 5** | Ejecución de los 6 casos de prueba (`CP-01` a `CP-06`), informe Go/No-Go, organización del Backlog `US-01` a `US-15` y cierre del Sprint 0. | QA Lead + Todo el equipo | `05-plan-pruebas-qa-y-backlog.md` completo y validado. |

### 5.2 Retrospectiva del Sprint 0 (Metodología *Start / Stop / Continue*)
- **¿Qué salió bien? (*Continue*):**
  - Separar desde el primer día el `backend-api` en capas (`routes`, `services`, `repositories`) y conectar el documento real `system_status/sprint0` en Cloud Firestore facilitó comprobar el flujo End-to-End sin datos simulados.
  - Definir un Glosario único de términos (*Sala*, *Panel*, *Ingreso*, *Chat*, *Compartir pantalla*) evitó contradicciones entre el prototipo y las rutas del frontend.
- **¿Qué dificultades tuvimos? (*Stop*):**
  - Inicialmente habíamos mezclado elementos de historias del Sprint 1 (como el formulario completo de Login) con la pantalla de la base técnica del Sprint 0; revisar la rúbrica criterio por criterio (`S0-C01` a `S0-C11`) nos permitió enfocar la vista principal `/` en el dato de Firestore y sus estados (`Cargando`, `Error con Reintentar` y `Éxito`).
- **¿Qué compromisos tomamos para el Sprint 1? (*Start*):**
  - Mantener ramas individuales por cada historia (`feature/US-01-...`, `feature/US-02-...`) desde el primer día del Sprint 1 para que los Pull Requests se revisen de forma progresiva y no acumulados al final de la semana.
