# 2. Guía Visual del Producto y Prototipo (Computador y Celular)

Documento de diseño visual e interactivo de **StudyRoom**, alineado con el criterio **`S0-C03`** de la rúbrica del Sprint 0 y cumplimiento de contraste **WCAG 2.2 Nivel AA**.

---

## 1. Paleta de Colores y Relaciones de Contraste (`S0-C03`)

La identidad visual de **StudyRoom** combina un fondo cálido de alta legibilidad que reduce la fatiga visual en sesiones largas de estudio con el color rojo institucional y textos oscuros de alto contraste.

| Token Semántico | Color Hex | Uso en la Interfaz | Contraste sobre su fondo | Cumplimiento WCAG 2.2 |
| :--- | :--- | :--- | :--- | :--- |
| **Fondo Principal (Lienzo)** | `#FDFBF9` | Fondo general de todas las pantallas | — | Base cálida antirreflejo |
| **Superficie de Tarjeta (Región Común)** | `#FDF0EC` | Contenedor de formularios y paneles (borde `#F3D5CC`) | — | Agrupación por Ley de Gestalt |
| **Superficie de Campos y Bloques** | `#FFFFFF` | Campos de texto, tarjetas de datos y botones secundarios | — | Contraste limpio |
| **Texto Principal** | `#1E293B` | Títulos `<h1>`–`<h3>`, etiquetas `<label>` y datos | **13.8 : 1** (sobre `#FDFBF9`) | **AAA** (Exige $\ge 4.5:1$) |
| **Texto Secundario** | `#475569` | Subtítulos, eslogan e instrucciones de ayuda | **7.2 : 1** (sobre `#FDFBF9`) | **AAA** (Exige $\ge 4.5:1$) |
| **Rojo Primario (Marca / CTA)** | `#D32F2F` | Logo StudyRoom, botón primario y pestaña activa (texto `#FFFFFF`) | **5.4 : 1** (con `#FFFFFF`) | **AA** (Exige $\ge 4.5:1$) |
| **Rojo Énfasis / Enlaces** | `#991B1B` | Enlaces de acción, insignias superiores y textos de alerta | **7.8 : 1** (sobre `#FDF0EC`) | **AAA** |
| **Estado de Error (Borde y Alerta)** | `#EF4444` / `#FEF2F2` | Borde de campo inválido y fondo de alerta con texto `#991B1B` | **8.1 : 1** | **AAA** |
| **Estado de Éxito (Conectado)** | `#065F46` / `#D1FAE5` | Indicador de conexión activa con Cloud Firestore | **7.4 : 1** | **AAA** |
| **Anillo de Foco de Teclado** | `#6366F1` (`ring-indigo-400`) | Contorno de 3px + halo al navegar con `Tab` (`WCAG 2.4.7`) | **5.1 : 1** | **AA** |

---

## 2. Tipografía (Máximo 2 Familias) e Iconografía (`S0-C03`)

1. **Familia Tipográfica 1 — Interfaz y Lectura (`Sans-Serif`):** `Inter, system-ui, -apple-system, sans-serif`.
   - `<h1>` Título de pantalla: `26px–30px` (`font-extrabold`, `#1E293B`).
   - `<h2>` Subtítulo de sección: `18px–20px` (`font-bold`, `#1E293B`).
   - Cuerpo y campos de formulario: `14px–16px` (`font-medium` / `font-normal`).
   - Etiquetas de campo (`<label>`): `12px` (`font-bold`, siempre visibles arriba del input).
2. **Familia Tipográfica 2 — Códigos y Rutas Técnicas (`Monospace`):** `JetBrains Mono, ui-monospace, monospace`.
   - Usada exclusivamente para códigos de **Sala** (ej. `CALC-101`), rutas de colección de Firestore (`system_status/sprint0`) y atajos de teclado (`Tab`, `Enter`).
3. **Estilo de Íconos:**
   - Íconos vectoriales SVG de trazo limpio (`stroke-width="2"`, `stroke-linecap="round"`).
   - **Regla de accesibilidad:** Todo ícono decorativo lleva `aria-hidden="true"` y `focusable="false"`, y todo botón con ícono incluye su texto visible o `aria-label` descriptivo.

---

## 3. Catálogo de Componentes Básicos de la Guía Visual (`S0-C03`)

1. **Botones (Ley de Fitts — altura mínima `48px` en acciones principales):**
   - *Botón Primario (CTA):* Fondo `#D32F2F`, hover `#B91C1C`, texto blanco en negrita, bordes redondeados `rounded-xl`. En estado de carga muestra spinner giratorio y texto *«Autenticando...»* o *«Cargando...»*.
   - *Botón de Autenticación Rápida (Google):* Fondo blanco `#FFFFFF`, borde `#E6C7BE`, altura mínima `48px`, ícono oficial de Google + texto *«Continuar con Google»* (`WCAG 3.3.8`).
2. **Campos de Texto (`<input>`):**
   - Etiqueta `<label htmlFor="...">` permanente en la parte superior.
   - Altura mínima de `48px`, fondo blanco `#FFFFFF`, borde `#E2C2B9` (cambia a `#EF4444` de `2px` cuando hay error de validación) y anillo de foco `#6366F1`.
3. **Tarjetas (Ley de Gestalt — Región Común):**
   - Contenedor `#FDF0EC` con borde `#F3D5CC`, radio `24px` y sombra suave que agrupa visualmente los elementos relacionados.
4. **Mensajes de Estado (Cargando, Éxito y Error):**
   - *Cargando:* Tarjeta blanca con spinner animado y `role="status"`.
   - *Error:* Contenedor `#FEF2F2` con borde `#EF4444`, texto `#991B1B`, `role="alert"` y botón **«Reintentar»**.
   - *Éxito:* Insignia verde esmeralda (`#D1FAE5` / `#065F46`) e información destacada con `role="region"`.
5. **Ventana de Confirmación (Modal Accesible):**
   - Para acciones críticas (como eliminar una **Sala** o eliminar el **Perfil**), se emplea un diálogo modal con `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco atrapado dentro del modal (*focus trap*), cierre con tecla `Escape` y dos botones claros: **«Cancelar»** (secundario) y **«Confirmar eliminación»** (rojo `#D32F2F`).

---

## 4. Prototipo de las Pantallas en Computador y Celular (`S0-C03`)

El diseño responsive se adapta automáticamente entre **Computador (Desktop $\ge 1024\text{px}$)** y **Celular (Mobile $360\text{px}–430\text{px}$)**:

### 4.1 Pantalla de la Base Técnica End-to-End (`/` — `TS-00`)
- **En Computador:** Encabezado horizontal con logo **StudyRoom**, enlace a Swagger API y barra de navegación con las rutas del mapa del sitio; tarjeta central de `672px` (`max-w-2xl`) que muestra el valor del campo `message` leído de Cloud Firestore (`system_status/sprint0`), cuadrícula de 3 columnas (`grid-cols-3`) con metadatos de Firestore y botones **«Recargar dato»** / **«Reintentar»**.
- **En Celular:** El encabezado y los botones se apilan verticalmente con ancho completo, la tarjeta ocupa el `100%` del ancho con márgenes laterales de `16px` (`px-4`) y las tarjetas de metadatos pasan a 1 sola columna (`grid-cols-1`) manteniendo botones táctiles de `44px–48px` de altura.

### 4.2 Pantalla de Ingreso (`/ingreso`) y Registro (`/registro`)
- **En Computador:** Tarjeta centrada de `440px` sobre el lienzo `#FDFBF9` con resplandores suaves laterales (`#FDE2DC`), estructurada en los 4 bloques clave:
  1. **Branding StudyRoom:** Ícono rojo + título **StudyRoom** + eslogan.
  2. **Encabezado de tarjeta:** *«BIENVENIDO DE NUEVO — Iniciar sesión»*.
  3. **Autenticación Rápida:** Botón ancho de **«Continuar con Google»** (`48px`) y divisor Gestalt *«o ingresa con tu correo»*.
  4. **Formulario manual:** Campos de *Correo institucional* y *Contraseña* (con botón de ojo para mostrar/ocultar), enlace *«¿Olvidaste tu contraseña?»*, botón primario rojo **«Iniciar sesión»** y enlace inferior a **Registro**.
- **En Celular:** La tarjeta se ajusta al ancho de la pantalla móvil (`w-full`), manteniendo áreas táctiles de `48px` de alto en todos los campos y botones para evitar errores de pulsación con el pulgar.
