# Feature Specification: Publicación en GitHub y Vercel

**Feature Branch**: `002-github-vercel-deploy`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Crear repositorio en GitHub, pushear cambios a main y desplegar en Vercel"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Repositorio versionado en GitHub (Priority: P1)

Como dueño del catálogo, quiero que el código fuente esté en un repositorio de GitHub
bajo mi cuenta, con la rama `main` actualizada, para tener respaldo, historial y base
para despliegues automáticos.

**Why this priority**: Sin repo remoto no hay deploy confiable ni colaboración futura.

**Independent Test**: El repositorio existe en GitHub, la rama `main` contiene el
proyecto completo y no incluye secretos (`.env.local` excluido).

**Acceptance Scenarios**:

1. **Given** el proyecto local listo, **When** se crea el repo y se hace push a `main`,
   **Then** el repositorio remoto refleja el código del catálogo.
2. **Given** el push completado, **When** se revisa el repo en GitHub,
   **Then** no aparecen archivos `.env.local` ni `node_modules/`.

---

### User Story 2 — Catálogo accesible en producción (Priority: P2)

Como vendedor, quiero que el catálogo esté publicado en una URL pública de Vercel para
compartir el link con clientes y que las imágenes de WhatsApp usen URLs de producción.

**Why this priority**: El valor comercial del catálogo depende de estar online.

**Independent Test**: Abrir la URL de producción muestra el catálogo; los links de
WhatsApp incluyen la URL de producción en las imágenes.

**Acceptance Scenarios**:

1. **Given** el repo en GitHub, **When** se despliega en Vercel,
   **Then** la URL pública carga el catálogo con las 139 fotos.
2. **Given** el deploy exitoso, **When** un cliente usa "Lo quiero" o finaliza carrito,
   **Then** el mensaje de WhatsApp contiene URLs de imagen con el dominio de producción.

---

### Edge Cases

- ¿Qué pasa si el repo ya existe? Reutilizar el remoto existente o crear con nombre alternativo.
- ¿Qué pasa si el build falla en Vercel? Revisar logs y corregir antes de marcar como listo.
- ¿Qué pasa si `NEXT_PUBLIC_SITE_URL` no está configurada? Las imágenes en WhatsApp apuntarían a localhost; debe setearse en Vercel post-deploy.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE crear (o conectar) un repositorio GitHub bajo la cuenta del owner.
- **FR-002**: El código DEBE pushearse a la rama `main` sin incluir secretos ni dependencias.
- **FR-003**: El proyecto DEBE desplegarse en Vercel como sitio estático Next.js.
- **FR-004**: La variable `NEXT_PUBLIC_SITE_URL` DEBE configurarse con la URL de producción.
- **FR-005**: El número de WhatsApp en `lib/whatsapp.ts` DEBE estar configurado antes de compartir el link.

### Key Entities

- **Repositorio**: nombre, owner, rama default (`main`), URL remota.
- **Deployment**: URL pública, estado (ready/error), variables de entorno.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El repositorio GitHub es accesible y `main` contiene el código del catálogo.
- **SC-002**: La URL de Vercel carga el catálogo en menos de 5 segundos en conexión móvil estándar.
- **SC-003**: Al menos una imagen en `/images/` es accesible públicamente desde la URL de producción.
- **SC-004**: Un mensaje de WhatsApp generado desde producción incluye al menos una URL de imagen con el dominio de Vercel.

---

## Assumptions

- La cuenta GitHub del owner es `IbatchI`.
- El nombre del repositorio será `pijama-catalog` (o variante si ya existe).
- Vercel detectará Next.js automáticamente; `output: 'export'` ya está configurado.
- El deploy inicial puede ser manual vía MCP; CI/CD automático en cada push es deseable pero no bloqueante para v1.
