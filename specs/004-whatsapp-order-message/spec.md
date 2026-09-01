# Feature Specification: Nuevo Formato de Mensaje WhatsApp

**Feature Branch**: `004-whatsapp-order-message`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Cambiar el mensaje de WhatsApp al formato de pedido: encabezado 🛍️ NUEVO PEDIDO, nombre del producto, talle como viñeta (- Talle XL 50/52), enlace Ver foto: {url}, y total al final. Ejemplo: ver spec y mensaje de referencia del usuario."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pedido único con formato claro (Priority: P1)

Un comprador elige una pijama, selecciona talle y usa "Lo quiero". El mensaje que
se abre en WhatsApp tiene un encabezado de pedido, el nombre del producto, el talle
en formato legible, un enlace para ver la foto y el total de ítems al cierre.

**Why this priority**: Es el flujo más frecuente y el que el vendedor ve en cada venta
directa. Si el formato es claro, reduce preguntas y acelera la confirmación.

**Independent Test**: Seleccionar talle XL en cualquier producto → "Lo quiero" →
verificar que el mensaje prellenado coincide con la plantilla de pedido único.

**Acceptance Scenarios**:

1. **Given** el usuario seleccionó talle XL 50/52 en "Pijama #67", **When** presiona
   "Lo quiero", **Then** el mensaje comienza con `🛍️ NUEVO PEDIDO`, incluye el nombre
   `Pijama #67`, la línea `- Talle XL 50/52`, `Ver foto:` con URL pública de la imagen,
   y cierra con `Total: 1 pijama(s) seleccionado(s)`.
2. **Given** un pedido de un ítem, **When** el vendedor lee el mensaje en WhatsApp,
   **Then** puede identificar producto, talle y foto sin texto introductorio tipo
   "Hola! Me interesan estos pijamas".
3. **Given** un pedido de un ítem, **When** se inspecciona el mensaje,
   **Then** no aparece numeración (`1.`, `2.`) ni el prefijo `📷` en el enlace de foto.

---

### User Story 2 — Carrito con varios ítems (Priority: P2)

Un comprador agrega varias pijamas (mismo o distinto modelo, talles distintos) al carrito
y finaliza el pedido. El mensaje lista cada ítem con el mismo bloque (nombre, talle,
ver foto) y un único total al final.

**Why this priority**: El carrito es el segundo canal de conversión. El vendedor debe
recibir un pedido estructurado igual de claro que en el flujo de un solo ítem.

**Independent Test**: Agregar 2 productos con talles M y S → Finalizar pedido →
verificar dos bloques de producto + total 2.

**Acceptance Scenarios**:

1. **Given** el carrito tiene 2 ítems con talles distintos, **When** el usuario
   finaliza el pedido, **Then** el mensaje tiene un solo encabezado `🛍️ NUEVO PEDIDO`,
   dos bloques de producto (cada uno con nombre, `- Talle …` y `Ver foto:`), y
   `Total: 2 pijama(s) seleccionado(s)` al final.
2. **Given** el carrito tiene la misma pijama en dos talles, **When** finaliza,
   **Then** aparecen dos bloques separados, uno por cada talle.
3. **Given** el carrito tiene más de 15 ítems, **When** finaliza,
   **Then** se listan como máximo 15 bloques completos y se indica cuántos ítems
   adicionales hay, más un enlace al catálogo completo (comportamiento de límite
   existente, adaptado al nuevo formato).

---

### User Story 3 — Consistencia entre "Lo quiero" y carrito (Priority: P3)

Tanto el atajo de un ítem como el checkout del carrito generan mensajes con la misma
estructura visual y las mismas etiquetas en español.

**Why this priority**: Evita confusión del vendedor al recibir dos “dialectos” distintos
según cómo compró el cliente.

**Independent Test**: Generar mensaje con "Lo quiero" y con carrito de 1 ítem;
comparar estructura — deben ser idénticos salvo el contenido del producto.

**Acceptance Scenarios**:

1. **Given** un ítem en carrito y el mismo ítem vía "Lo quiero", **When** se comparan
   los mensajes generados, **Then** comparten encabezado, etiquetas (`Talle`, `Ver foto:`,
   `Total`) y orden de líneas.
2. **Given** cualquier flujo de compra válido, **When** se genera el mensaje,
   **Then** la URL de la foto es absoluta (dominio del sitio desplegado + ruta de imagen).

---

### Edge Cases

- ¿Qué pasa con nombres de producto con caracteres especiales (`, `, `?`, emojis)?
  Deben aparecer legibles en el mensaje tras la codificación del enlace WhatsApp.
- ¿Qué pasa con carrito vacío? No se genera mensaje (sin cambio respecto al comportamiento actual).
- ¿Qué pasa si la URL del sitio es localhost en desarrollo? El mensaje usa esa base;
  en producción debe usar el dominio público (ej. catalog.vercel.app).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todo mensaje de pedido DEBE comenzar con la línea `🛍️ NUEVO PEDIDO`.
- **FR-002**: Cada ítem DEBE mostrarse como bloque con: nombre del producto en línea
  propia, luego `- Talle {etiqueta completa}` (ej. `- Talle XL 50/52`), luego
  `Ver foto: {url absoluta de la imagen}`.
- **FR-003**: El mensaje DEBE terminar con `Total: {N} pijama(s) seleccionado(s)`
  donde N es la cantidad de ítems del pedido (sin emoji adicional al final).
- **FR-004**: Entre bloques de ítems DEBE haber una línea en blanco para separación
  visual (como en el ejemplo de referencia).
- **FR-005**: El flujo "Lo quiero" y el checkout del carrito DEBEN usar la misma plantilla.
- **FR-006**: Cada ítem DEBE incluir talle y enlace de foto (requisito de negocio existente;
  no se elimina información, solo cambia presentación).
- **FR-007**: No se usa numeración ordinal (`1.`, `2.`) en la lista de productos.
- **FR-008**: No se usa el texto de apertura `Hola! Me interesan estos pijamas:` ni
  el prefijo `📷` antes de la URL de imagen.
- **FR-009**: Si el pedido supera 15 ítems, el mensaje DEBE truncar la lista a 15
  bloques, indicar cuántos faltan y ofrecer enlace al catálogo completo.

### Key Entities

- **Mensaje de pedido**: texto prellenado enviado por WhatsApp; compuesto por encabezado,
  uno o más bloques de ítem, y pie con total.
- **Bloque de ítem**: nombre + viñeta de talle + línea "Ver foto:" + URL.
- **Ítem de pedido**: producto + talle seleccionado (misma información que el carrito actual).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los mensajes generados en pruebas manuales (1 ítem y 2+ ítems)
  siguen la plantilla acordada sin campos obligatorios faltantes.
- **SC-002**: Un vendedor puede identificar producto, talle y enlace de foto en menos de
  10 segundos por ítem al leer el mensaje en WhatsApp.
- **SC-003**: Los mensajes de "Lo quiero" y carrito de 1 ítem son estructuralmente
  idénticos en el 100% de las pruebas de regresión.
- **SC-004**: Pedidos de hasta 15 ítems caben en el límite de longitud de URL de WhatsApp
  sin truncamiento inesperado (misma política de overflow que hoy).

---

## Assumptions

- El emoji 🛍️ en el encabezado es deseado y fijo (no configurable por el vendedor en v1).
- La etiqueta de talle usa el texto completo ya definido en el catálogo (ej. `XL 50/52`).
- "Ver foto:" es la etiqueta fija en español para el enlace de imagen.
- El total no incluye emoji decorativo (ej. sin ✨), alineado al ejemplo del usuario.
- Esta feature es solo cambio de copy/formato del mensaje; no cambia número de WhatsApp,
  flujo de carrito ni selección de talle.
- Mensaje de referencia del usuario (pedido único):

  ```
  🛍️ NUEVO PEDIDO

  Pijama #67
  - Talle XL 50/52

  Ver foto: http://localhost:3000/images/IMG-20260831-WA0067.jpg

  Total: 1 pijama(s) seleccionado(s)
  ```
