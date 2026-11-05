# 3. Estrategia de Accesibilidad WCAG 2.2 Nivel AA (Foco en Ceguera Total)

Documento obligatorio de la historia técnica **TS-04**. Define los criterios de conformidad **WCAG 2.2 Nivel A y AA** bajo los cuatro principios (**Perceptible, Operable, Comprensible y Robusto**), cómo están implementados en el código y cómo se comprueban en cada sprint.

---

## 1. Enfoque en Usuarios con Ceguera Total

Una persona con ceguera total interactúa con la aplicación sin referencia visual de diseño espacial, color o íconos gráficos. Su experiencia depende de dos pilares:
1. **Operabilidad total por teclado**: Todo flujo (`T1` a `T4`) debe poder completarse usando únicamente `Tab`, `Shift+Tab`, `Enter`, `Espacio`, `Escape` y teclas de flecha, sin trampas de teclado.
2. **Árbol de accesibilidad semántico para el Lector de Pantalla (NVDA / VoiceOver / JAWS)**:
   - Navegación rápida por regiones (*Landmarks* con tecla `D` en NVDA).
   - Navegación por jerarquía de encabezados (`<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>` con tecla `H` en NVDA).
   - Anuncio automático de eventos asíncronos (carga de datos de Firestore, errores, llegada de mensajes de chat o cambios de micrófono/pantalla) mediante regiones vivas (`aria-live` / `role="status"` / `role="alert"`).

---

## 2. Matriz de Criterios WCAG 2.2 Aplicados y Verificación

| Principio | Criterio WCAG 2.2 | Nivel | Implementación en la Aplicación | Método de Comprobación |
| :--- | :--- | :---: | :--- | :--- |
| **Perceptible** | **1.3.1 Información y relaciones** | A | Uso de landmarks nativos `<header>`, `<nav>`, `<main>`, `<footer>`, listas `<dl>/<dt>/<dd>` para datos de Firestore y jerarquía estricta `<h1>`–`<h3>`. | Inspección con lector de pantalla (lista de elementos `Insert+F7` en NVDA) y auditoría Lighthouse. |
| **Perceptible** | **1.4.3 Contraste (mínimo)** | AA | Paleta de colores con contraste superior a `9:1` en textos y `4.5:1` en todos los estados (`loading`, `error`, `success`). | Verificación automática con **Lighthouse** y extensión **axe DevTools**. |
| **Perceptible** | **1.4.4 Cambio de tamaño del texto** | AA | Unidades relativas (`rem`) y diseño responsive con Flexbox/Grid que soporta zoom del 200% sin pérdida de contenido. | Zoom del navegador al 200% verificando ausencia de scroll horizontal. |
| **Operable** | **2.1.1 Teclado** y **2.1.2 Sin trampas de teclado** | A | Uso exclusivo de elementos nativos interactivos (`<button>`, `<a>`) que reciben foco y se activan con `Enter`/`Espacio`. | Recorrido completo de la interfaz desconectando el mouse. |
| **Operable** | **2.4.1 Evitar bloques (Bypass Blocks)** | A | Enlace **«Saltar al contenido principal»** (`href="#contenido-principal"`) como primer elemento del DOM que mueve el foco al `<main>`. | Presionar `Tab` al cargar la página y pulsar `Enter`; verificar que el foco pasa directo al `<main>`. |
| **Operable** | **2.4.2 Titulado de páginas** | A | `document.title` cambia dinámicamente en cada vista (*"Inicio y Base Técnica \| Salón de Estudio..."* vs *"Accesibilidad WCAG 2.2 AA \| Salón de Estudio..."*). | Cambiar de vista con teclado y comprobar que el título de la pestaña y el anuncio de NVDA cambian. |
| **Operable** | **2.4.7 Foco visible** y **2.4.11 Apariencia del foco (Nuevo en 2.2)** | AA | Regla global `*:focus-visible` con contorno sólido `#1E1B4B` de `3px` y sombra amarilla `#FDE047` de `5px`. | Navegar con `Tab` por todos los botones y enlaces comprobando visibilidad inmediata del foco. |
| **Comprensible** | **3.1.1 Idioma de la página** | A | Atributo `<html lang="es">` declarado en `frontend/index.html`. | Verificar que NVDA/VoiceOver lee el contenido con fonética en español y Lighthouse aprueba `[lang]`. |
| **Comprensible** | **3.3.1 Identificación de errores** | A | Cuando falla la lectura de Firestore, el bloque de error explica qué falló y ofrece un botón de reintento inmediato. | Apagar `backend-api` o usar credenciales inválidas y comprobar el anuncio del error. |
| **Robusto** | **4.1.2 Nombre, función, valor** | A | Atributos `aria-current="page"` en la navegación activa, `aria-label` descriptivos y textos `.sr-only` en enlaces externos. | Revisión del Accessibility Tree en Chrome DevTools. |
| **Robusto** | **4.1.3 Mensajes de estado** | AA | Estado de carga con `role="status" aria-live="polite" aria-busy="true"` y estado de error con `role="alert" aria-live="assertive"`. | Activar el botón «Actualizar desde Firestore» con NVDA encendido y escuchar el anuncio sin mover el foco. |

---

## 3. Protocolo de Auditoría en Cada Sprint

1. **Prueba automatizada (Criterio Done ≥ 90 en Sprints 0–5 y ≥ 95 en Sprint 6):**
   - Ejecutar **Google Lighthouse** (categoría *Accessibility*) en modo incógnito sobre la URL publicada en **Vercel**.
   - Ejecutar **axe DevTools** verificando `0` violaciones críticas o serias.
2. **Prueba manual solo con teclado:**
   - Cargar la URL publicada, presionar `Tab`, activar «Saltar al contenido principal», recorrer botones de navegación, actualizar el dato de Firestore y abrir la vista de Accesibilidad sin tocar el ratón.
3. **Prueba con Lector de Pantalla (NVDA en Windows / VoiceOver en macOS):**
   - Con el monitor apagado o sin mirar la pantalla, verificar que se anuncia el título de la página en español, las regiones (`banner`, `navegación`, `principal`, `información del contenido`) y el valor del documento leído desde Firestore.
