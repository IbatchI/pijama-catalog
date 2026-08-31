# Feature Specification: Catálogo de Pijamas — Navegación y Carrito

**Feature Branch**: `001-pijama-catalog`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Pagina estática en Next desplegada en Vercel con catálogo responsivo paginado de pijamas (15 por página), cards que muestran solo la foto, carrito con Zustand, componentes Shadcn, botón 'Lo quiero' y checkout vía WhatsApp con imágenes."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Navegar el catálogo de pijamas (Priority: P1)

Un comprador potencial recibe un link del catálogo, lo abre en su celular y puede recorrer
todas las opciones de pijamas disponibles. Las imágenes se ven grandes, claras y organizadas
en una grilla. El usuario avanza de página en página hasta encontrar lo que le interesa.

**Why this priority**: Es el flujo base del negocio. Sin navegación funcional no hay venta posible.
Todo lo demás depende de que el usuario pueda ver los productos.

**Independent Test**: Puede probarse completamente abriendo la página y verificando que se
muestran 15 fotos por página con paginación funcional, sin necesidad de carrito ni WhatsApp.

**Acceptance Scenarios**:

1. **Given** el usuario abre la URL del catálogo, **When** la página carga, **Then** ve una grilla
   de 15 pijamas con sus fotos, en un diseño responsivo adaptado a su dispositivo.
2. **Given** el usuario está en la primera página, **When** hace clic en "Siguiente", **Then**
   la vista muestra los siguientes 15 pijamas sin recargar la página entera.
3. **Given** el usuario está en la última página, **When** la visualiza, **Then** el botón
   "Siguiente" está deshabilitado o no aparece.
4. **Given** el catálogo tiene menos de 15 productos disponibles en la página actual,
   **When** se muestra la página, **Then** se ven solo los productos disponibles (sin espacios vacíos forzados).

---

### User Story 2 — Agregar pijamas al carrito y finalizar con WhatsApp (Priority: P2)

El comprador selecciona varios pijamas de distintas páginas del catálogo, los acumula en
un carrito persistente y, cuando termina, envía un mensaje por WhatsApp al vendedor con
el detalle de lo que quiere, incluyendo las imágenes de cada prenda seleccionada.

**Why this priority**: Es el flujo principal de conversión. Permite compras de múltiples
artículos, que es el caso más común en una venta real.

**Independent Test**: Puede probarse seleccionando 2–3 productos, abriendo el carrito y
verificando que el botón de WhatsApp abre la app con un mensaje que contiene nombre e
imagen de cada producto seleccionado.

**Acceptance Scenarios**:

1. **Given** el usuario ve una card de pijama, **When** presiona "Agregar al carrito",
   **Then** el contador del carrito (visible en todo momento) se incrementa en 1.
2. **Given** el usuario navega a otra página del catálogo, **When** regresa,
   **Then** los items del carrito siguen presentes (estado persistente durante la sesión).
3. **Given** el carrito tiene 1 o más items, **When** el usuario abre el resumen del carrito,
   **Then** ve la lista de pijamas seleccionados con sus fotos y puede eliminar items individuales.
4. **Given** el usuario revisa el carrito, **When** presiona "Finalizar pedido",
   **Then** se abre WhatsApp (app o web) con un mensaje precompuesto que incluye nombre y
   enlace de imagen de cada pijama seleccionado, dirigido al número del vendedor.
5. **Given** el carrito está vacío, **When** el usuario intenta finalizar,
   **Then** el botón de finalizar está deshabilitado o muestra un aviso claro.

---

### User Story 3 — Compra directa con "Lo quiero" (Priority: P3)

El comprador ve una sola prenda que le gusta y quiere contactar al vendedor de inmediato,
sin necesidad de armar un carrito. Presiona "Lo quiero" directamente en la card y se abre
WhatsApp con un mensaje precompuesto para ese único producto.

**Why this priority**: Reduce la fricción para compras impulsivas o cuando el comprador
solo quiere un artículo. Mejora la tasa de conversión para casos de ítem único.

**Independent Test**: Puede probarse presionando "Lo quiero" en cualquier card y verificando
que WhatsApp abre con un mensaje que referencia nombre e imagen de esa prenda específica.

**Acceptance Scenarios**:

1. **Given** el usuario ve una card de pijama, **When** presiona "Lo quiero",
   **Then** se abre WhatsApp con un mensaje que incluye el nombre del pijama y el enlace
   de su imagen, sin requerir carrito ni pasos intermedios.
2. **Given** el usuario usa "Lo quiero" desde un dispositivo sin WhatsApp instalado,
   **When** se activa el enlace, **Then** se abre WhatsApp Web en el navegador como fallback.

---

### Edge Cases

- ¿Qué ocurre si una imagen de producto no carga (URL rota o archivo faltante)? La card debe
  mostrar un placeholder visual y no romper la grilla.
- ¿Qué pasa si el carrito acumula muchos productos y el mensaje de WhatsApp supera el
  límite de caracteres de la URL? El mensaje debe truncarse o dividirse de forma controlada,
  notificando al usuario si aplica.
- ¿Qué ocurre en pantallas muy pequeñas (<320px)? La grilla debe adaptarse (mínimo 1 columna)
  sin desbordamiento horizontal.
- ¿Qué pasa si el usuario cierra la pestaña y vuelve? El carrito se pierde (comportamiento
  aceptado para v1; persistencia entre sesiones queda fuera de alcance).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar los productos en una grilla responsiva que se adapta
  a móvil (1–2 columnas), tablet (3 columnas) y escritorio (4–5 columnas).
- **FR-002**: El catálogo DEBE estar paginado mostrando exactamente 15 productos por página.
- **FR-003**: Cada card de producto DEBE mostrar únicamente la fotografía del pijama,
  sin texto, precio ni nombre visible en la grilla principal.
- **FR-004**: Cada card DEBE exponer dos acciones: "Agregar al carrito" y "Lo quiero".
- **FR-005**: El carrito DEBE ser accesible desde cualquier página del catálogo mediante
  un indicador siempre visible (ej. ícono con contador de items).
- **FR-006**: El carrito DEBE permitir ver el resumen de items seleccionados con foto y nombre.
- **FR-007**: El carrito DEBE permitir eliminar items individuales.
- **FR-008**: La acción de finalizar pedido DEBE construir un mensaje de WhatsApp que incluya,
  por cada pijama seleccionado: nombre del producto y URL pública de su imagen.
- **FR-009**: La acción "Lo quiero" DEBE construir un mensaje de WhatsApp equivalente a
  FR-008 pero para un único producto, sin requerir interacción con el carrito.
- **FR-010**: El carrito DEBE estar deshabilitado para finalizar cuando no tiene items.
- **FR-011**: Cada producto DEBE tener los atributos: nombre, precio y tipo/categoría
  definidos en una fuente de datos estática mantenible por el equipo.
- **FR-012**: La estructura de datos de productos DEBE soportar que las imágenes estén
  organizadas en subcarpetas por categoría, para acomodar el crecimiento futuro del catálogo.
- **FR-013**: El sistema DEBE ser desplegable como sitio estático sin requerir servidor
  en tiempo de ejecución.

### Key Entities

- **Producto**: nombre (string), precio (número), tipo/categoría (string), ruta de imagen (string).
  Representa un pijama en el catálogo. Las imágenes viven en carpetas organizadas bajo
  el directorio de assets públicos.
- **Item de Carrito**: referencia al Producto. El carrito contiene una colección de items
  seleccionados por el usuario durante la sesión activa.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La página inicial del catálogo carga en menos de 3 segundos en una conexión
  móvil estándar (3G/4G).
- **SC-002**: El catálogo despliega correctamente todos los productos disponibles
  (actualmente ~139) distribuidos en páginas de 15 items sin errores visuales.
- **SC-003**: Un comprador puede completar el flujo completo (ver catálogo → seleccionar
  pijama → enviar por WhatsApp) en menos de 5 pasos de interacción.
- **SC-004**: El diseño no presenta desbordamiento horizontal en ningún viewport entre
  320px y 1440px de ancho.
- **SC-005**: El mensaje de WhatsApp generado contiene nombre e imagen de cada producto
  seleccionado, verificable en el 100% de los casos de uso del carrito y "Lo quiero".
- **SC-006**: Al eliminar un item del carrito, el contador visible se actualiza
  inmediatamente sin recargar la página.

---

## Assumptions

- Las fotos de pijamas (~139 imágenes JPEG) se copian al directorio público del proyecto y
  se sirven desde el mismo dominio que la app, garantizando URLs públicas permanentes.
- Los datos de productos (nombre, precio, tipo) se definen manualmente en un archivo de
  datos estático (JSON o TypeScript) coubicado con el código fuente; no existe un CMS o
  base de datos en v1.
- Para v1, el nombre del producto puede derivarse del nombre de archivo de la imagen hasta
  que el equipo defina nombres comerciales definitivos.
- El número de teléfono WhatsApp del vendedor se configura como variable de entorno en el
  proyecto; no es visible en el código fuente.
- El mecanismo de WhatsApp para v1 es un deep-link `wa.me` con texto precompuesto.
  No se requiere integración con la API oficial de WhatsApp Business para esta fase.
- No se requiere autenticación: el catálogo es público.
- No se implementan filtros, búsqueda ni orden en v1. La única navegación es la paginación.
- El estado del carrito vive únicamente en memoria del navegador durante la sesión; si el
  usuario cierra la pestaña, el carrito se vacía (comportamiento esperado y aceptado).
- El precio de cada pijama es opcional en v1 y puede mostrarse en el carrito/resumen,
  pero no aparece en la card de la grilla principal.
