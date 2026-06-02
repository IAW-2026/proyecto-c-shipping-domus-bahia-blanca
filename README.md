# Domus Shipping

Webapp de gestion de turnos para visitas inmobiliarias. Permite a compradores solicitar visitas, a agentes gestionar turnos asignados y a administradores consultar y administrar entidades principales del sistema.

## Funcionalidades Principales

**Reserva de visitas inmobiliarias:** Los compradores pueden seleccionar una propiedad, elegir día y horario disponible, agregar observaciones y registrar una solicitud de visita.

**Gestión de turnos para agentes:** Los agentes inmobiliarios cuentan con un dashboard donde pueden ver turnos pendientes, aceptar solicitudes, consultar su agenda semanal y gestionar visitas confirmadas, canceladas o completadas.

**Clima estimado con OpenWeather:** Al coordinar una visita, la app consulta OpenWeather para mostrar el pronóstico estimado según la ubicación de la propiedad y la fecha seleccionada.

**Mapas interactivos:** La vista detallada de cada turno muestra la ubicación de la propiedad mediante mapas interactivos, facilitando la referencia geográfica de la visita.

**Autenticación con Clerk:** El sistema utiliza Clerk para gestionar el inicio de sesión de administradores, agentes y compradores, manteniendo separados los permisos y flujos de cada tipo de usuario.

**Panel de administración:** El administrador puede consultar entidades principales, gestionar agentes, crear y editar turnos, filtrar registros por estado o inmobiliaria y visualizar reportes básicos del sistema.

**APIs propias:** La app expone endpoints REST para consultar turnos por inmobiliaria o comprador, modificar estados y facilitar futuras integraciones con otras webapps del ecosistema.

## Deploy

Link de produccion: `https://proyecto-c-shipping-domus-bahia.vercel.app`

## Acceso

La autenticacion se realiza con Clerk.

- Administrador: ingresar por `/sign-in` con un usuario que tenga rol `admin` en Clerk. Desde ahi se accede al panel `/dashboard` donde aparece una seccion especial de admin.
- Agente inmobiliario: ingresar por `/sign-in`; si su perfil esta en pendiente se lo redirecciona a `/cuenta-en-revision` o si esta rechazado a `/cuenta-rechazada`.

- Usuario comprador/Agente Inmobiliario : Ingresa como buyer desde `/sign-in` y como todavia no tiene perfil de agente inmobiliario se lo redirecciona a `/onboarding` donde completa un formulario y se le asigna el rol de agente inmobiliario pero queda pendiente a confirmacion por la seller app.

- Usuario comprador : ingresar por la buyer app al apretar el boton de reservar, visita `/sign-in` si no esta logeado y se lo redirecciona a visita desde `/pedirturno?propiedadId={idprop}&source=external`. (Si el usuario ya tiene un turno para esa propiedad se lo redirije a /turnos/gracias) Ejemplos mockeados: `proyecto-c-shipping-domus-bahia.vercel.app/pedirturnos?propiedadId=casa-cj&source=external` en vez de casa-cj puede ser `luke-house` o `casa-simpsons`

Credenciales de prueba:

- Administrador: `: mail: admin+clerk_test@iaw.com / contraseña: iawuser#`
- Agente: `mail: agente+clerk_test@iaw.com / contraseña: iawuser#`
- Comprador: `mail: buyer+clerk_test@iaw.com / contraseña: iawuser#`
- Codigo de verificacion: 424242

## Decisiones 

### SEO
Decidi no aplicar un robots: index true, follow true para todas las paginas sino que la directiva noindex, nofollow en las páginas privadas de la aplicación, es decir, aquellas que requieren autenticación para ser accedidas, como el dashboard, la agenda, la gestión de turnos y el panel administrativo en la unica que no lo aplique es en la de sign-in o / donde tiene mas sentido ya que no son paginas privadas.

### Creacion de agentes
No permito crear agentes desde el panel de admin debido a que rompe la sincronizacion con clerk, podria ser un proximo feature a considerar.

## Errores a mejorar
- No pude mejorar el rendimiento de lighthouse en el panel de log in para mobile.

## Proximos features
- Agregar interactivo testeo de APIs desde el panel de admin
- Mejorar lighthouse de mobile para log in

