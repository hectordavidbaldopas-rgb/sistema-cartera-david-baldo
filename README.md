# Sistema de Cartera — David Baldo Seguros

Etapas 1 a 9 del sistema descripto en `../ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md`
(arquitectura, clientes/vendedores/ramos/compañías, pólizas con historial y
vencimientos, CRM con tareas y WhatsApp, estadísticas, importación de Excel,
portal del cliente con encuesta, comisiones/liquidaciones, auditoría).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Prisma 6 + SQLite local (`prisma/dev.db`) — migrar a PostgreSQL/Supabase antes de publicar
- Auth.js (NextAuth v5) con credenciales + roles (`admin` / `seller` / `client`)
- Vitest para tests unitarios de la lógica de negocio pura (`npm test`)

## Cómo correr en desarrollo

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Base de datos

```bash
npx prisma db push      # aplica el schema (en dev; usar migrate en producción)
npx prisma db seed      # recrea catálogo + vendedores + importa la cartera real desde el Excel
npx prisma studio       # explorador visual de la base
npm test                # corre los tests unitarios
```

El seed lee `../Base de Cartera - David Baldo.xlsx` (un nivel arriba de esta
carpeta) y carga los 361 clientes / 446 pólizas reales tal como están hoy en
el Excel maestro.

## Login

Vendedores y clientes tienen esquemas de login distintos (la pantalla de
login es la misma para los dos, solo cambia qué se escribe como usuario):

- **Vendedores/admin**: usuario = su **DNI**, contraseña inicial = los
  últimos 4 dígitos de ese DNI.
- **Clientes**: usuario = los **últimos 6 dígitos de su teléfono** (sin el 0,
  sin el 15, sin característica de zona — en la práctica, el número de
  abonado tal cual está guardado), contraseña inicial = **`0000`** para
  todos por igual. Se eligió teléfono en vez de DNI porque casi ningún
  cliente tiene DNI cargado en la cartera importada, y teléfono sí.

Cualquiera puede cambiar su contraseña después desde "Mi cuenta" (arriba a
la derecha, en el dashboard o en el portal) — importante hacerlo porque
estas contraseñas iniciales son fáciles de adivinar por diseño.

- **Vendedores**: el DNI se carga al crear el vendedor (`/admin/vendedores/nuevo`)
  o se agrega/corrige después editándolo — al cargarlo, el login pasa a ser
  ese DNI automáticamente y la contraseña se reinicia a sus últimos 4 dígitos.
- **Clientes**: desde la ficha del cliente (`/dashboard/clientes/:id`) hay un
  botón "Generar acceso al portal" — pide que el cliente ya tenga teléfono
  cargado. Mismo botón sirve para reiniciar la contraseña o resincronizar el
  usuario si el teléfono cambió.

### Logins de vendedores (los 3 ya tienen DNI real cargado)

| Vendedor | Login (DNI) | Contraseña inicial |
|---|---|---|
| Lucas (admin) | `36236280` | `6280` |
| David | `22543873` | `3873` |
| Ruben | `16398428` | `8428` |

### Clientes

Ninguno tiene acceso al portal generado todavía — se va armando de a uno
desde la ficha de cada cliente ("Generar acceso al portal"), ya que casi
todos tienen teléfono cargado desde la importación inicial.

**Ojo con colisiones:** si dos clientes distintos terminan compartiendo los
mismos últimos 6 dígitos de teléfono (poco probable pero posible entre
distintas características de zona), el sistema avisa y no deja generar el
acceso duplicado — hay que revisar los teléfonos de ambos en ese caso.

## Autocompletado de datos por el cliente

Como gran parte de la cartera importada del Excel llegó con compañía y
DNI sin cargar, el portal del cliente (`/portal`) deja que cada cliente
ayude a completar esos huecos sobre sus propios datos:

- **"Mis datos" (`/portal/datos`)**: adicional a teléfono/email/domicilio,
  ahora también se puede cargar el **DNI** y un **teléfono alternativo /
  de emergencia** (`Client.alternatePhone`, campo nuevo).
- **Pólizas**: en cada cobertura que todavía tiene la compañía sin
  confirmar o el ramo en "Otro", aparece un mini-formulario ("Ayudanos a
  completar esta cobertura") para que el cliente elija la compañía y el
  tipo de póliza correctos desde el catálogo existente. Una vez cargados
  ambos, el formulario desaparece solo.

Estos cambios no tocan campos administrativos (comisión, estado de la
póliza, notas internas) — siguen siendo de uso exclusivo de vendedores/admin,
tal como pide la sección 34 del documento de arquitectura.

## Decisiones tomadas (a revisar)

- `Policy.companyId` se dejó **opcional** (el documento de arquitectura pide
  que sea obligatorio). Casi ninguna póliza real tiene compañía cargada
  todavía, así que se optó por permitir nulo y marcar el estado de la
  póliza como `draft` hasta completarse, en vez de inventar una compañía o
  bloquear la importación.
- Los ramos (`InsuranceBranch`) se cargaron con las categorías reales del
  desplegable del Excel (`Auto/Moto/Camioneta/Camion`, `Combinado Familiar`,
  etc.), no con la lista de ejemplo del documento.
- Las notas de importación del Excel (alertas de teléfono duplicado, datos
  faltantes, etc.) se guardaron en `Client.notes`, porque el modelo
  `Policy` del documento no tiene un campo de notas propio.
- Las reglas automáticas de tareas (sección 15 del documento) están
  implementadas pero **nunca se disparan solas** — siempre piden confirmar
  después de mostrar una vista previa con el conteo, para no inundar de
  golpe la cartera de tareas (`/dashboard/tareas`).
- El login usa el mismo campo `email` del modelo `User` para guardar el
  usuario, sea DNI (vendedores) o los 6 dígitos del teléfono (clientes) —
  evita una migración/rename grande. En pantalla el login dice "Usuario",
  nunca "email", pero en la base sigue siendo la columna `email`.

## Qué falta / a confirmar

- Los 3 vendedores deberían cambiar su contraseña inicial (últimos 4 del DNI,
  fácil de adivinar) desde "Mi cuenta".
- Ir generando el acceso al portal cliente por cliente (ya tienen el
  teléfono necesario) y avisarles la contraseña `0000` para que la cambien.
- Migrar de SQLite a PostgreSQL (Supabase) antes de usar en producción con
  varios dispositivos al mismo tiempo.
- Testing solo cubre la lógica pura (vencimientos, estado de datos del
  cliente, plantillas de WhatsApp, mapeo de ramos, credenciales) — no hay
  tests de integración de las Server Actions ni end-to-end todavía.
