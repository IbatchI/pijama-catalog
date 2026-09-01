# Feature Specification: Previsualización de Imagen en Cards

**Feature Branch**: `005-image-preview`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "El usuario hace click o tap (mobile) sobre la imagen del producto y se abre un modal para visualizar la imagen en pantalla completa. Debe ser responsive. En desktop, al hacer hover sobre la imagen aparece un ícono de lupa/zoom para indicar que la imagen es ampliable."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ampliar foto con tap o click (Priority: P1)

Un comprador está navegando el catálogo y quiere ver mejor el estampado o la tela de una
pijama. Toca la foto en el celular o hace click en la foto en desktop/tablet y se abre
una vista ampliada que ocupa prácticamente toda la pantalla, mostrando la imagen con buena
legibilidad y sin salir del catálogo.

**Why this priority**: Es el valor central de la feature. Sin abrir la vista ampliada no
hay previsualización útil y el comprador no puede confirmar detalles visuales antes de
pedir.

**Independent Test**: En cualquier dispositivo, tocar o hacer click en la foto de una card
y verificar que aparece la vista ampliada con la imagen del producto correcto.

**Acceptance Scenarios**:

1. **Given** el usuario ve una card con foto cargada, **When** toca la foto en un
   dispositivo táctil, **Then** se abre una vista ampliada a pantalla completa con esa
   imagen.
2. **Given** el usuario ve una card con foto cargada, **When** hace click en la foto con
   mouse o trackpad, **Then** se abre la misma vista ampliada con esa imagen.
3. **Given** la vista ampliada está abierta, **When** el usuario la observa,
   **Then** la imagen mantiene su proporción (no se deforma) y es claramente más grande
   que la miniatura de la card.
4. **Given** la vista ampliada está abierta, **When** el usuario la cierra,
   **Then** permanece en la misma página del catálogo, en la misma paginación, con el
   carrito y el talle seleccionado en esa card sin cambios.

---

### User Story 2 — Descubrir la ampliación en desktop con hover (Priority: P2)

Un comprador en computadora pasa el mouse sobre la foto de una pijama y ve un ícono de
lupa/zoom superpuesto, lo que le indica que puede hacer click para ver la imagen ampliada.

**Why this priority**: En desktop no hay gesto de "tap" obvio; el affordance de hover
reduce la fricción y evita que el usuario no descubra la función.

**Independent Test**: En un viewport de escritorio, pasar el mouse sobre la foto sin hacer
click y verificar que aparece el ícono de zoom; al quitar el mouse, el ícono desaparece.

**Acceptance Scenarios**:

1. **Given** el usuario está en un viewport donde el hover es aplicable (típicamente
   escritorio), **When** posiciona el cursor sobre la foto de una card,
   **Then** aparece un ícono de lupa/zoom centrado o claramente visible sobre la imagen.
2. **Given** el ícono de zoom está visible por hover, **When** el usuario retira el cursor
   de la foto, **Then** el ícono desaparece y la foto vuelve a su estado normal.
3. **Given** el usuario está en un dispositivo táctil sin hover, **When** ve la foto de
   una card, **Then** no depende del hover para abrir la vista ampliada (el tap sigue
   funcionando sin mostrar permanentemente el ícono de zoom).

---

### User Story 3 — Cerrar la vista ampliada de forma intuitiva (Priority: P3)

Un comprador terminó de revisar la foto ampliada y quiere volver al catálogo rápidamente,
usando el método que le resulte más natural según su dispositivo.

**Why this priority**: Una vista ampliada difícil de cerrar frustra al usuario y bloquea
la compra. El cierre debe ser predecible en todos los contextos.

**Independent Test**: Abrir la vista ampliada y cerrarla por cada método disponible
(botón cerrar, toque/click fuera de la imagen, tecla Escape en teclado).

**Acceptance Scenarios**:

1. **Given** la vista ampliada está abierta, **When** el usuario presiona el control de
   cerrar visible, **Then** la vista se cierra y el foco vuelve al elemento que abrió la
   previsualización.
2. **Given** la vista ampliada está abierta, **When** el usuario toca o hace click en el
   área oscurecida fuera de la imagen, **Then** la vista se cierra.
3. **Given** la vista ampliada está abierta y el usuario tiene teclado, **When** presiona
   Escape, **Then** la vista se cierra.
4. **Given** la vista ampliada está abierta, **When** el usuario navega con teclado,
   **Then** el foco permanece contenido dentro de la vista hasta cerrarla (no queda atrapado
   detrás del overlay).

---

### Edge Cases

- ¿Qué pasa si la imagen de la card falló al cargar? La zona de foto no debe abrir una
  vista ampliada vacía; puede mostrarse deshabilitada o sin interacción de ampliación.
- ¿Qué pasa si el usuario abre la vista ampliada y cambia el tamaño de ventana? La imagen
  ampliada debe seguir siendo usable y proporcional en el nuevo tamaño.
- ¿Qué pasa si hay scroll en la página al abrir la vista? El contenido de fondo no debe
  desplazarse mientras la vista ampliada está abierta.
- ¿Qué pasa si el usuario abre la vista ampliada de un producto y luego intenta abrir otra
  sin cerrar? Solo una vista ampliada puede estar activa a la vez; la nueva reemplaza a la
  anterior o la anterior se cierra primero.
- ¿Qué pasa con lectores de pantalla? El disparador debe anunciarse como acción de ver foto
  ampliada del producto; al cerrar, el foco regresa al disparador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir abrir una vista ampliada de la foto del producto
  al hacer tap (dispositivos táctiles) o click (dispositivos con puntero) sobre la imagen
  de la card.
- **FR-002**: La vista ampliada DEBE mostrar la misma imagen del producto que la card,
  en tamaño significativamente mayor y ocupando prácticamente toda el área visible de la
  pantalla (pantalla completa o equivalente responsive).
- **FR-003**: La vista ampliada DEBE preservar la proporción de la imagen sin recortes
  que oculten partes relevantes del producto.
- **FR-004**: En viewports de escritorio (donde aplica hover), al posicionar el cursor
  sobre la foto de la card DEBE mostrarse un ícono de lupa/zoom superpuesto que indique
  que la imagen es ampliable.
- **FR-005**: El ícono de zoom por hover NO DEBE ser requisito para abrir la vista ampliada
  en dispositivos táctiles.
- **FR-006**: La vista ampliada DEBE poder cerrarse mediante: control de cerrar visible,
  interacción con el fondo fuera de la imagen, y tecla Escape en dispositivos con teclado.
- **FR-007**: Al cerrar la vista ampliada, el usuario DEBE permanecer en la misma página,
  paginación, carrito y selección de talle de la card de origen.
- **FR-008**: Mientras la vista ampliada esté abierta, el scroll del catálogo detrás DEBE
  estar bloqueado.
- **FR-009**: Solo UNA vista ampliada puede estar abierta a la vez en toda la página.
- **FR-010**: El disparador de la foto DEBE tener un nombre accesible que identifique el
  producto (por ejemplo, "Ver foto ampliada de Pijama #67").
- **FR-011**: Si la imagen de la card no está disponible, el sistema NO DEBE abrir una
  vista ampliada vacía.

### Key Entities

- **Producto (card)**: Ítem del catálogo con nombre, foto y metadatos ya existentes; la
  foto actúa como disparador de previsualización.
- **Vista ampliada**: Estado transitorio de UI que muestra una única imagen de producto a
  tamaño grande, superpuesta al catálogo, hasta que el usuario la cierra.
- **Disparador de foto**: Área interactiva de la imagen en la card; en desktop incluye
  affordance visual de zoom al hover.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las fotos cargadas correctamente en cards permiten abrir y cerrar
  la vista ampliada en una sola interacción de apertura y una de cierre, en mobile y desktop.
- **SC-002**: En pruebas en viewport de escritorio, el ícono de zoom es visible en menos
  de 1 segundo al hacer hover sobre la foto, en al menos el 95% de los intentos.
- **SC-003**: Tras cerrar la vista ampliada, el talle previamente seleccionado en la card
  y el contenido del carrito permanecen idénticos en el 100% de los casos de prueba.
- **SC-004**: Usuarios con lector de pantalla pueden identificar el disparador de ampliación
  y cerrar la vista sin quedar atrapados en el overlay (verificación manual en al menos un
  flujo completo abrir → cerrar).
- **SC-005**: La imagen ampliada es claramente legible en viewports desde 320px de ancho
  hasta escritorio ancho, sin deformación visible del producto.

## Assumptions

- La previsualización usa la misma imagen estática ya servida en la card; no se requiere
  generar variantes adicionales ni galería multi-foto por producto en esta versión.
- "Pantalla completa" significa overlay que cubre el viewport disponible con la imagen
  como foco principal; no implica modo fullscreen nativo del navegador (F11).
- El breakpoint de hover/zoom en desktop se alinea con el estándar responsive del catálogo
  (típicamente tablet/escritorio); en móvil prima el tap sin depender del hover.
- La feature aplica solo a fotos en cards del grid del catálogo; miniaturas del carrito
  quedan fuera de alcance salvo decisión futura.
- No se requiere zoom adicional con pellizco/pinch dentro del modal en v1; solo vista
  ampliada estática centrada.
- Alineado con constitución v1.3.0 (Principio III — Image preview).

## Out of Scope

- Galería de múltiples fotos por producto.
- Zoom con gestos (pinch-to-zoom) dentro del modal.
- Descarga o compartir imagen desde la vista ampliada.
- Previsualización desde miniaturas del carrito o del checkout.
- Rotación o edición de imagen.
