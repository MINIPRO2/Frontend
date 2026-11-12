# Documento Único de Evidencias (DUE) — Sprint 1: Identidad y Autenticación (T1)

**Proyecto:** StudyRoom — Salón de Estudio Colaborativo en Tiempo Real  
**Sprint:** Sprint 1 — Identidad y Autenticación (`T1`) · **Peso:** 10 %  
**Historias del Sprint 1:** `TS-01` (Autenticación y usuarios en la API) · `US-01` (Registro manual) · `US-02` (Registro e ingreso con Google + elección obligatoria de username) · `US-03` (Inicio y cierre de sesión seguro + protección de rutas privadas)

---

## 1. Planeación, Roles y Seguimiento del Sprint 1 (`S1-C10`)

### 1.1 Objetivo del Sprint
Permitir que los estudiantes puedan registrarse (de forma manual con correo/contraseña o con Google), elegir obligatoriamente un nombre de usuario único (`username`) validado en el servidor, iniciar y cerrar sesión de forma segura, y proteger las pantallas privadas (`/dashboard` y `/firestore`) verificando el token de sesión en el Backend API.

### 1.2 Rotación de Roles en el Sprint 1
| Rol en el Sprint 1 | Integrante Responsable | Responsabilidades Principales |
| :--- | :--- | :--- |
| **UX Lead** (`S1-C01`, `S1-C02`, `S1-C03`) | `[Integrante UX]` | Prototipo navegable desktop/móvil, aplicación de las 10 heurísticas de Nielsen y consistencia visual. |
| **FE Lead** (`S1-C04`, `S1-C05`) | `[Integrante FE]` | Implementación en React + TS + Tailwind de `/login`, `/register`, `/completar-username`, `/dashboard` y `/firestore` con todos sus estados. |
| **BE Lead** (`S1-C06`, `S1-C07`) | `[Integrante BE]` | Middleware `verifyAuthToken` (Firebase Admin), endpoints `/api/users/*` en 3 capas, transacción de `username` único en Firestore, Docker y Swagger. |
| **QA / Accesibilidad Lead** (`S1-C08`, `S1-C09`) | `[Integrante QA]` | Matriz de pruebas Dado/Cuando/Entonces, pruebas con teclado y NVDA, Lighthouse $\ge 90$ e informe de regresión del Sprint 0. |
| **Coordinación** (`S1-C10`, `S1-C11`, `S1-C12`) | `[Integrante Coord]` | Tablero actualizado, ramas y PRs por historia, despliegues en Vercel/Render y consolidación del DUE. |

---

## 2. Decisiones de Diseño UX y Heurísticas de Nielsen (`S1-C01`, `S1-C02`, `S1-C03`)

### 2.1 Dos Decisiones de Diseño Documentadas en Bitácora (`S1-C02`)
1. **Decisión 1 — Pantalla limpia de Login sin barra de navegación superior y separación pos-login:**
   - *Problema que resolvía:* En el Sprint 0 existía una barra superior con múltiples enlaces de rutas vacías que distraían al usuario antes de autenticarse y daban la impresión de poder navegar a vistas privadas sin sesión.
   - *Heurísticas de Nielsen aplicadas:* **#8 (Diseño estético y minimalista — pantallas limpias, solo con lo necesario)** y **#5 (Prevención de errores)**. El usuario ve únicamente el formulario de autenticación al entrar, y la navegación hacia **Panel** (`/dashboard`) y **Estado Firestore** (`/firestore`) aparece solo tras iniciar sesión.
2. **Decisión 2 — Validación de errores junto al campo conservando los datos escritos y paso obligatorio de Username para Google:**
   - *Problema que resolvía:* Cuando un correo ya estaba registrado o el `username` estaba ocupado, borrar el formulario obligaba al estudiante a digitar todo de nuevo; además, el registro con Google no capturaba un `username` único.
   - *Heurísticas de Nielsen aplicadas:* **#9 (Ayudar a reconocer, diagnosticar y recuperarse de errores)**, **#1 (Visibilidad del estado del sistema)** y **#5 (Prevención de errores)**. Los errores se anuncian junto al campo correspondiente sin borrar lo escrito, y si el usuario entra por primera vez con Google es dirigido obligatoriamente a `/completar-username` antes de desbloquear el Panel.

---

## 3. Implementación Backend (`TS-01` · `S1-C06` y `S1-C07`)

### 3.1 Endpoints Implementados y Documentados en Swagger (`/api-docs`)
| Método y Ruta | Protección | Descripción y Validaciones en Servidor | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| `GET /api/users/check-username` | Pública | Valida formato (3–20 caracteres) y consulta en Firestore si el `username` está disponible. | `200`, `400`, `500` |
| `GET /api/users/me` | `Bearer Token` (`verifyAuthToken`) | Obtiene el perfil del usuario autenticado desde `users/{uid}` en Firestore. | `200`, `401`, `404` |
| `POST /api/users/register` | `Bearer Token` (`verifyAuthToken`) | Crea el perfil manual (`firstName`, `lastName`, `username`, `avatar`, `email`) con transacción atómica de unicidad de `username`. | `201`, `400`, `401` |
| `POST /api/users/google-sync` | `Bearer Token` (`verifyAuthToken`) | Sincroniza la cuenta de Google en Firestore y devuelve `requiresUsername: true` si aún no tiene `username`. | `200`, `401` |
| `PUT /api/users/username` | `Bearer Token` (`verifyAuthToken`) | Asigna el `username` único obligatorio mediante transacción en Firestore (`usernames/{usernameLower}`). | `200`, `400`, `401` |
| `PUT /api/users/profile` | `Bearer Token` (`verifyAuthToken`) | Actualiza nombres, apellidos, avatar y `username` único validado en servidor. | `200`, `400`, `401` |

---

## 4. Casos de Prueba QA del Sprint 1 y Regresión del Sprint 0 (`S1-C08`, `S1-C09`, `S1-C12`)

| ID Caso | Historia | Escenario (Dado / Cuando / Entonces) | Tipo | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **CP-S1-01** | `US-01` | **Dado** un estudiante nuevo en registro manual, **Cuando** completa nombres, apellidos, `username` disponible, avatar, correo y contraseña válida, **Entonces** se crea su cuenta en Firebase Auth y Firestore y entra a `/dashboard`. | Camino ideal | Cuenta creada (`201`) e ingreso automático al Panel. |
| **CP-S1-02** | `US-01` / `TS-01` | **Dado** el formulario de registro manual, **Cuando** ingresa un `username` que ya existe en Firestore o un correo ya registrado, **Entonces** el servidor rechaza el duplicado y se muestra el mensaje claro junto al campo sin borrar los demás datos. | Caso de error | Mensaje *«Este nombre de usuario ya está ocupado»* junto al campo conservando lo escrito. |
| **CP-S1-03** | `US-01` | **Dado** el formulario de registro manual, **Cuando** deja campos obligatorios vacíos, escribe un correo mal formado o una contraseña débil (< 6 caracteres), **Entonces** muestra el mensaje explicando cómo corregirlo junto al campo. | Caso de error | Validación accesible (`aria-invalid="true"`) junto a cada campo. |
| **CP-S1-04** | `US-02` | **Dado** un estudiante que ingresa con Google por primera vez, **Cuando** finaliza la ventana de Google, **Entonces** es llevado obligatoriamente a elegir su `username` antes de poder ver `/dashboard`. | Camino ideal + bloqueo | No puede saltar `/completar-username` hasta guardar un `username` único. |
| **CP-S1-05** | `US-03` | **Dado** un usuario registrado, **Cuando** inicia sesión con correo y contraseña incorrectos, **Entonces** visualiza *«Correo o contraseña incorrectos»*. | Caso de error | Alerta clara sin códigos técnicos de Firebase. |
| **CP-S1-06** | `US-03` / `TS-01` | **Dado** un usuario en `/dashboard`, **Cuando** pulsa **«Cerrar sesión»** o intenta abrir `/dashboard` sin sesión activa, **Entonces** es redirigido a `/login` y la API responde `401` ante peticiones sin token. | Seguridad | Rutas privadas protegidas en cliente y con `401` en API. |
| **CP-S1-07** | `S1-C12` (Regresión) | **Dado** un usuario autenticado, **Cuando** navega a **Estado Firestore** (`/firestore`), **Entonces** visualiza en tiempo real el estado de conexión con Cloud Firestore (`GET /api/sprint0/status`). | Regresión Sprint 0 | Base técnica del Sprint 0 funcionando al 100 %. |
