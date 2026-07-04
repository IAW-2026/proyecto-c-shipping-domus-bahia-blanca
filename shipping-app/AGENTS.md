# AGENTS.md

## Proyecto

Domus — sistema inmobiliario construido con:

* Next.js 14 App Router
* TypeScript
* Prisma ORM
* PostgreSQL
* Clerk Authentication
* Tailwind CSS
* Lucide React

---

# Reglas importantes

## Autenticación

* Clerk es la fuente de verdad de autenticación.
* El `userId` de Clerk es el mismo `id` en la base de datos.
* NO existe `clerkUserId`.

---

# Tipos de usuarios

## Agentes inmobiliarios

Modelo:

* `AgenteInmobiliario`

Estados posibles:

* `APROBADO`
* `PENDIENTE`
* `RECHAZADO`

Acceden a:

* `/dashboard/*`

Guards:

* `requireAgente`
* `getAgente`

---

## Buyers / Compradores

* No tienen modelo en base de datos.
* Solo se almacena `compradorId` en `Turno`.
* Acceden a:

  * `/turnos/*`

---

# Modelo principal

## Turno

Estados:

* `PENDIENTE_AGENTE`
* `PRE_ACEPTADO`
* `CONFIRMADO`
* `COMPLETADO`
* `CANCELADO`

---

# Convenciones

## Server Actions

Patrón:

```tsx
<form action={action.bind(null, id)}>
```

### Flujo completo

Usar:

* `revalidatePath`
* `redirect`

### Cambios parciales

Usar:

* solo `revalidatePath`

---

# Restricciones importantes

## NO HACER

* No refactorizar archivos fuera del alcance pedido.
* No cambiar arquitectura sin pedirlo.
* No cambiar nombres de estados.
* No introducir Redux.
* No introducir Zustand.
* No migrar a Pages Router.
* No usar Clerk webhooks salvo que se pida explícitamente.
* No crear `clerkUserId`.

---

# Diseño

## UI

Estilo:

* warm neutral
* beige / crema
* oklch tokens
* estética minimalista

Fuente display:

* Fraunces

---

# Mapas

* Leaflet
* Siempre con:

```tsx
dynamic(() => import(...), { ssr: false })
```

---

# Timezone

Usar siempre:

* `America/Argentina/Buenos_Aires`

No usar timezone implícita.

---

# APIs REST existentes

* GET `/api/turnos/comprador/[compradorId]`
* PATCH `/api/turnos/comprador/[compradorId]/turno/[turnoId]`

Mantener convenciones REST.

---

# Performance y contexto

## IMPORTANTE

Cuando trabajes:

* NO analizar `node_modules`
* NO analizar `.next`
* NO analizar `dist`
* NO analizar `build`
* NO analizar archivos lock

Trabajar solo con archivos relacionados a la tarea pedida.

Si falta contexto:

* pedir archivos específicos primero.

No hacer búsquedas globales innecesarias.

---

# Preferencias de código

* TypeScript estricto
* Componentes pequeños
* Server Components por defecto
* Client Components solo si son necesarios
* Tailwind antes que CSS custom
* Mantener código simple y explícito

---

# Prisma

* Mantener schema consistente
* No duplicar IDs de Clerk
* Relaciones explícitas
* Evitar lógica compleja dentro del schema

---

# Objetivo

Priorizar:

* claridad
* mantenibilidad
* simplicidad
* bajo acoplamiento
* flujo de negocio explícito
