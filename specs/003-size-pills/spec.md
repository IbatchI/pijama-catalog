# Feature Specification: Selección de Talle en Cards

**Feature Branch**: `003-size-pills`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Agregar pills de talle en cada card del catálogo (S 38/40, M 42/44, L 46/48, XL 50/52). Los botones Agregar al carrito y Lo quiero solo aparecen cuando el usuario selecciona un talle. El talle debe incluirse en el carrito y en el mensaje de WhatsApp. Usar pills del design system del proyecto y tipos necesarios (size)."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Elegir talle antes de comprar (Priority: P1)

Un comprador ve una pijama en el catálogo, toca el talle que necesita (por ejemplo
"M 42/44") y recién entonces aparecen las opciones para agregar al carrito o pedirla
directamente por WhatsApp.

**Why this priority**: Sin selección de talle no hay pedido válido. Es el prerequisito
de cualquier conversión y evita mensajes incompletos al vendedor.

**Independent Test**: Abrir el catálogo, verificar que las acciones de compra están
ocultas; seleccionar un talle y confirmar que aparecen ambas acciones.

**Acceptance Scenarios**:

1. **Given** el usuario ve una card sin talle seleccionado, **When** observa la card,
   **Then** no ve botones de "Agregar al carrito" ni "Lo quiero".
2. **Given** el usuario ve una card, **When** toca el pill "L 46/48",
   **Then** ese pill queda visualmente activo y aparecen las dos acciones de compra.
3. **Given** el usuario tiene seleccionado "S 38/40", **When** toca "M 42/44",
   **Then** solo "M 42/44" queda activo (un talle a la vez por card).
4. **Given** el usuario seleccionó un talle, **When** toca el mismo pill otra vez,
   **Then** el talle permanece seleccionado (no se deselecciona; las acciones siguen visibles).

---

### User Story 2 — Carrito con talle por ítem (Priority: P2)

El comprador agrega varias pijamas al carrito, algunas del mismo modelo pero en talles
distintos, y puede revisar en el resumen qué talle pidió de cada una.

**Why this priority**: El vendedor necesita el talle en cada línea del pedido. Sin esto
el carrito pierde valor frente al flujo de WhatsApp.

**Independent Test**: Agregar la misma pijama en talle M y en talle L; abrir el carrito
y verificar dos líneas distintas con sus talles.

**Acceptance Scenarios**:

1. **Given** el usuario seleccionó "M 42/44" y presiona "Agregar al carrito",
   **When** abre el carrito, **Then** ve el producto con el talle "M 42/44".
2. **Given** el usuario ya tiene una pijama en talle M en el carrito, **When** agrega
   la misma pijama en talle L, **Then** el carrito muestra dos líneas separadas (M y L).
3. **Given** el usuario intenta agregar la misma pijama con el mismo talle dos veces,
   **When** presiona "Agregar al carrito" de nuevo, **Then** no se duplica la línea
   (comportamiento actual del carrito se mantiene: un ítem por producto+talle).
4. **Given** el usuario elimina un ítem del carrito, **When** confirma la eliminación,
   **Then** desaparece solo esa combinación producto+talle.

---

### User Story 3 — WhatsApp con talle incluido (Priority: P3)

El comprador finaliza un pedido (carrito o "Lo quiero") y el mensaje de WhatsApp que se
abre incluye el talle elegido junto al nombre e imagen de cada pijama.

**Why this priority**: Cierra el loop de venta. El vendedor recibe pedidos accionables
sin tener que preguntar "¿qué talle?".

**Independent Test**: Seleccionar talle XL, usar "Lo quiero", verificar que el mensaje
contiene "XL 50/52". Repetir con carrito de 2 ítems con talles distintos.

**Acceptance Scenarios**:

1. **Given** el usuario seleccionó "XL 50/52" y presiona "Lo quiero",
   **When** se abre WhatsApp, **Then** el mensaje incluye el nombre del producto y
   el texto "XL 50/52".
2. **Given** el carrito tiene 2 productos con talles M y S, **When** el usuario
   finaliza el pedido, **Then** el mensaje lista ambos productos cada uno con su talle
   correspondiente ("M 42/44" y "S 38/40").
3. **Given** el usuario no seleccionó talle, **When** intenta interactuar con acciones
   de compra, **Then** las acciones no están disponibles (no hay camino sin talle).

---

### Edge Cases

- ¿Qué pasa si el usuario cambia de página del catálogo y vuelve? La selección de
  talle en cada card se reinicia (no persiste entre páginas ni entre navegación).
- ¿Qué pasa en pantallas muy angostas? Los cuatro pills deben caber en la card sin
  desbordar horizontalmente (pueden reducirse o apilarse en dos filas si hace falta).
- ¿Qué pasa si el carrito tenía ítems sin talle de una versión anterior? No aplica —
  esta feature introduce el talle como requisito; no hay datos legacy en producción.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada card del catálogo DEBE mostrar exactamente cuatro opciones de talle:
  `S 38/40`, `M 42/44`, `L 46/48`, `XL 50/52`.
- **FR-002**: El usuario DEBE poder seleccionar un solo talle por card a la vez.
- **FR-003**: El talle seleccionado DEBE tener un estado visual activo claramente distinguible.
- **FR-004**: Los botones "Agregar al carrito" y "Lo quiero" DEBEN estar ocultos hasta
  que el usuario seleccione un talle.
- **FR-005**: Al agregar al carrito, el ítem DEBE almacenar el producto junto con el
  talle seleccionado (etiqueta completa, ej. "M 42/44").
- **FR-006**: La misma pijama en talles distintos DEBE tratarse como líneas separadas
  en el carrito.
- **FR-007**: La misma pijama con el mismo talle NO DEBE duplicarse en el carrito.
- **FR-008**: El resumen del carrito DEBE mostrar el talle junto al nombre de cada producto.
- **FR-009**: El mensaje de WhatsApp (tanto "Lo quiero" como finalizar carrito) DEBE
  incluir el talle de cada ítem en texto legible.
- **FR-010**: El catálogo de talles es fijo: no hay talles por producto ni stock por talle
  en esta versión (todos los productos ofrecen los mismos 4 talles).

### Key Entities

- **Talle (Size)**: una de las cuatro opciones fijas del catálogo.
  - Valores internos: `S`, `M`, `L`, `XL`
  - Etiquetas visibles: `S 38/40`, `M 42/44`, `L 46/48`, `XL 50/52`
- **Ítem de carrito**: combina un producto con un talle seleccionado. La identidad
  única de un ítem es producto + talle (no solo producto).
- **Selección de talle en card**: estado local por card, indica qué talle está activo
  antes de una acción de compra.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las cards del catálogo muestran las 4 opciones de talle sin
  requerir scroll horizontal en viewports ≥ 320px.
- **SC-002**: En pruebas manuales, ningún flujo de compra (carrito o "Lo quiero") es
  accesible sin haber seleccionado un talle primero.
- **SC-003**: El 100% de los mensajes de WhatsApp generados en pruebas incluyen el
  talle correcto para cada producto listado.
- **SC-004**: Un comprador puede agregar la misma pijama en dos talles distintos y ver
  ambas líneas correctamente en el carrito en menos de 30 segundos.
- **SC-005**: El resumen del carrito muestra el talle en el 100% de los ítems agregados
  con esta feature activa.

---

## Assumptions

- Los cuatro talles aplican a todos los productos del catálogo; no hay productos sin talle.
- No se valida disponibilidad de stock por talle (el vendedor confirma por WhatsApp).
- La selección de talle no persiste si el usuario cambia de página del catálogo.
- El componente visual de pills seguirá el design system ya adoptado en el proyecto
  (patrón toggle/pill accesible, estilo sobrio y profesional).
- Los tipos de datos del proyecto se extenderán para incluir `Size` como enumeración
  fija de cuatro valores; esto es un cambio de modelo acotado, no un catálogo por producto.
- Esta feature modifica el comportamiento existente del carrito y de WhatsApp definido
  en la feature 001; no introduce nuevos canales de venta.
