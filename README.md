# API de torneo · Express 5 + JavaScript

Implementación del backend para jugadores, videojuegos, puntuaciones, clasificación y estadísticas. Node 24.21.0, npm 11.19.0, JavaScript ESM. Puerto predeterminado: **3000**, host `127.0.0.1`.

Esta entrega contiene los 17 endpoints de negocio originales, POST /api/usuarios para crear Administradores, autenticación HTTP Basic contra MySQL, salud del servicio, validación, consultas parametrizadas y protección persistente contra reintentos de creación de puntuaciones. No contiene frontend, vistas Pug ni archivos generados de NestJS.

## 1. Integrar en tus carpetas

El ZIP contiene una carpeta `torneo-express-api`. Copia su contenido a la raíz de tu backend, conservando el `.git` que ya tenga el proyecto. Los nombres corresponden a la estructura acordada: `app.js`, `src/config`, `controllers`, `routes`, `services`, `repositories`, etc. El archivo de arranque es `src/server.js`; `bin/www` ya no se utiliza. Los archivos de ejemplo de `views`, `public` y las antiguas rutas `index/users` pueden retirarse una vez reemplazadas sus referencias.

El `package.json` entregado reemplaza la configuración del generador Express. Incluye un lockfile para instalar de forma reproducible. Conserva cualquier información propia del equipo al adaptar el README y los metadatos del paquete.

Punto 3 del reto: esta es una propuesta de código producida con IA, uso expresamente permitido. El equipo debe probarla, integrarla y demostrar los RF conforme a los demás puntos del Markdown. No representa una conexión ya verificada a su Railway ni evidencia de QA sobre su frontend.

Git debe existir desde el comienzo. Antes de copiar, registra el esqueleto actual con un commit real y crea `feature/backend-base`. Si ya tienes un repositorio, no ejecutes `git init` nuevamente. La entrega no incluye un historial ficticio del equipo. Implementa/revisa e integra por ramas las funcionalidades incluidas según el plan de trabajo acordado.

## 2. Instalar

En la raíz del backend y con Node 24.21.0/npm 11.19.0 activos:

```bash
node --version
npm --version
npm ci
```

El backend y Vite pueden tener versiones de Node distintas. Cada uno necesita su propio proceso y dependencias. En Windows, algunos gestores como nvm-windows cambian globalmente la versión seleccionada; coordina los ejecutables/procesos con frontend.

Copiar configuración (PowerShell):

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

## 3. Configurar MySQL y autenticación por usuarios

Configura DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD en `.env`. `PORT=3000`, `HOST=127.0.0.1` y FRONTEND_ORIGIN mantienen sus valores anteriores. DB_NAME debe ser la base que realmente contiene tus tablas: la URL proporcionada apunta a railway, pero el script original creaba BDTorneo.

La cuenta fija API_USER/API_PASSWORD_HASH deja de utilizarse. Puede retirarse de `.env`; no se utiliza como acceso alternativo. La autenticación HTTP Basic recibe **Correo y contraseña original** y consulta usuarios JOIN Rol en cada solicitud protegida. No se implementó JWT ni una sesión/cookie.

Matriz estricta: Superadministrador crea Administradores y escribe videojuegos; Administrador escribe jugadores/puntuaciones. No se heredan permisos entre roles. Todo visitante puede consultar los GET de negocio. `/api/auth/me` requiere autenticación y `/api/health/ready` requiere Superadministrador. No hay listado público de usuarios.

## 4. Migraciones y primer Superadministrador

Requisito: MySQL 8.0.16+ o 9 con tablas InnoDB.

1. Mantener las tres tablas originales y la migración 001_api_solicitudes.sql de la entrega anterior.
2. Aplicar `database/migrations/003_usuarios_roles.sql`, coordinado con BD. Si ya existen usuarios/Rol, revisar sus tipos, nombres, claves y restricciones en lugar de ejecutar CREATE TABLE otra vez. La columna `Contraseña` almacena un hash, y Correo y Rol.Nombre son únicos.
3. Generar el hash de la contraseña del primer Superadministrador con `npm run auth:hash`. Entrada oculta, mínimo 15 caracteres. Copiar solo lo que sigue a PASSWORD_HASH=.
4. Ajustar nombre, correo y hash en `database/seed_superadministrador.example.sql` y ejecutarlo manualmente con el responsable de BD. Debe insertar una fila. Con el marcador sin sustituir no inserta ninguna. No existe un endpoint público para crear Superadministradores.
5. Si hay solicitudes idempotentes de la antigua cuenta .env, detener escrituras y mapear esa identidad a la cuenta real del mismo operador mediante `004_mapear_idempotencia_legacy.example.sql`, antes de reanudar tráfico. No se realiza una asignación automática porque el backend no sabe a qué persona corresponde la cuenta anterior. Sin ese mapeo, las claves antiguas pertenecen a otra identidad y no deduplican reintentos bajo la cuenta nueva. Investigar conflictos UNIQUE; no eliminar registros para ocultarlos.

`database/schema_nueva.sql` es solo para una base vacía. La migración 002 de índice sigue siendo opcional. No se ejecutan migraciones al arrancar ni se modificó Railway desde esta conversación.

## 5. Arrancar en el puerto 3000

```bash
npm run dev
```

Sin observar cambios:

```bash
npm start
```

El servidor valida configuración, versión, presencia de tablas e InnoDB antes de escuchar. Si falta la migración o hay un error de conexión, termina con código 1; no simula conexión satisfactoria.

Abrir:

`http://localhost:3000/api/health`

Respuesta:

```json
{ "status": "ok" }
```

`/api/health` comprueba que el proceso está vivo. `GET /api/health/ready`, con autenticación, comprueba también MySQL. La raíz `/` no tiene endpoint; devuelve 404. Ctrl+C cierra servidor y pool con un máximo de 10 segundos.

Si aparece EADDRINUSE, libera el proceso que ya usa 3000. No cambies arbitrariamente el puerto si React ya tiene acordada la URL.

## 6. Endpoints y contratos

Los GET de jugadores, videojuegos, puntuaciones, clasificación y estadísticas son públicos. POST/PATCH/DELETE requieren el rol correspondiente; la autenticación ya no se aplica globalmente a /api.

| Método | Ruta | Resultado / RF |
| --- | --- | --- |
| POST | `/api/jugadores` | Crear jugador, 201 · RF01 |
| GET | `/api/jugadores?buscar=Shadow&page=1&limit=20` | Listar/buscar por nombre OR gamertag · RF04/RF05/RF07 |
| GET | `/api/jugadores/:id` | Consultar jugador |
| PATCH | `/api/jugadores/:id` | Actualizar campos enviados |
| DELETE | `/api/jugadores/:id` | Eliminar, 204 o 409 si tiene puntuaciones |
| POST | `/api/videojuegos` | Crear videojuego, 201 · RF02 |
| GET | `/api/videojuegos?page=1&limit=20` | Catálogo para RF05 |
| GET | `/api/videojuegos/:id` | Consultar videojuego |
| PATCH | `/api/videojuegos/:id` | Actualizar campos enviados |
| DELETE | `/api/videojuegos/:id` | Eliminar, 204 o 409 si tiene puntuaciones |
| POST | `/api/puntuaciones` | Crear con Idempotency-Key, 201 · RF03/RF05 |
| GET | `/api/puntuaciones?ID_jugador=1&ID_videojuego=1` | Historial con filtros opcionales y paginación |
| GET | `/api/puntuaciones/:id` | Consultar puntuación |
| PATCH | `/api/puntuaciones/:id` | Modificar puntuación y/o asociados |
| DELETE | `/api/puntuaciones/:id` | Eliminar, 204 |
| GET | `/api/clasificacion?ID_videojuego=1` | Clasificación del videojuego obligatorio · RF06 |
| GET | `/api/estadisticas?ID_videojuego=1` | Estadísticas globales si no hay filtro · RF08 |
| POST | `/api/usuarios` | Crear un Administrador; solo Superadministrador |
| GET | `/api/auth/me` | Obtener ID, nombre, correo y rol de la cuenta autenticada |
| GET | `/api/health` | Estado del proceso, público |
| GET | `/api/health/ready` | Comprobar MySQL; solo Superadministrador |

Listados: `page` predeterminado 1, máximo 10000; `limit` predeterminado 20, máximo 100. Orden `ID DESC`, excepto clasificación. Búsqueda parcial: `%`, `_` y `!` escritos por el usuario se tratan como caracteres literales, no comodines SQL. La sensibilidad a mayúsculas/acentos depende de la collation real.

El JSON conserva los nombres del esquema: `ID`, `ID_jugador`, `ID_videojuego`, `fecha_registro`, etc. Acordar estos nombres con React; esta entrega no usa `id` como alias.

Registro/consulta individual:

```json
{ "data": { "ID": 1, "nombre": "Christian", "gamertag": "CP", "correo": "c@example.com", "fecha_registro": "2026-09-14 12:00:00" } }
```

Listado:

```json
{ "data": [], "pagination": { "page": 1, "limit": 20 } }
```

Errores:

```json
{ "error": { "code": "RELATED_RECORDS", "message": "No se puede eliminar: existen puntuaciones relacionadas." }, "requestId": "..." }
```

Códigos: 400 validación, 401 credenciales, 403 sin permisos, 404 inexistente, 409 duplicado/conflicto/referencias al eliminar, 413 cuerpo grande, 422 asociado inexistente, 429 límite de tráfico, 503 conflicto temporal de transacción y 500 error inesperado. Los errores no exponen SQL, contraseñas ni stack.

## 7. Probar en Postman

Para escrituras, configura Authorization → Basic Auth: el Correo de un usuario registrado y su contraseña original. Usa Superadministrador para videojuegos y alta de usuarios, y Administrador para jugadores/puntuaciones. Los GET de negocio no necesitan Authorization. No uses aquí la contraseña de MySQL. El cuerpo debe estar en Body → raw → JSON.

POST `/api/jugadores`:

```json
{ "nombre": "Christian", "gamertag": "CP", "correo": "c@example.com" }
```

POST `/api/videojuegos`:

```json
{ "nombre": "Tekken", "genero": "Lucha" }
```

POST `/api/puntuaciones`, usando los IDs REALES devueltos:

```json
{ "ID_jugador": 1, "ID_videojuego": 1, "puntuacion": 950 }
```

Agregar el header `Idempotency-Key` con un UUID de esa operación. Repetir la solicitud con la misma clave y mismos datos devuelve la misma puntuación; el header `Idempotency-Replayed` cambia a `true`. Utilizar otra clave para una participación nueva, aunque el puntaje sea idéntico.

PATCH `/api/puntuaciones/1` permite, por ejemplo:

```json
{ "ID_jugador": 2, "ID_videojuego": 1, "puntuacion": 1000 }
```

Incluye solamente los campos que quieras cambiar. No admite ID de registro, fechas, null, campos extra ni cuerpo vacío.

## 8. Reglas implementadas

- Obligatorios y longitudes iguales al esquema. Se recortan espacios en textos. El correo tiene validación básica de formato y puede repetirse.
- Gamertag y nombre de videojuego únicos por sus restricciones MySQL. El backend traduce los errores concurrentes de unicidad a 409.
- Puntuaciones enteras entre 0 y 2147483647. No se convierten strings numéricos. Referencias garantizadas por claves foráneas, también al editar.
- Eliminar jugadores o videojuegos con puntuaciones devuelve 409; no hay cascada.
- Ediciones serializadas con transacciones y bloqueo de fila. Si dos solicitudes editan el mismo campo, prevalece la que se ejecuta después; no se implementa control de versión optimista.
- Fechas automáticas al crear y conservadas al editar. Modificar una puntuación cambia el ranking según su valor actual y su fecha original.
- Clasificación: exige un videojuego existente; selecciona la mayor puntuación por jugador y, entre máximos iguales del mismo jugador, el registro más antiguo. Orden final: puntaje descendente, fecha ascendente, ID ascendente. Posiciones consecutivas 1,2,3; se calculan antes de paginar. Los registros históricos con fecha NULL se colocan después de los que sí tienen fecha para el mismo puntaje.
- Estadísticas globales: total de las tres tablas y AVG de todas las puntuaciones. Filtradas: participantes distintos de ese juego, un videojuego, cantidad de registros y su promedio. Sin puntuaciones: promedio null. Un videojuego inexistente produce 404; un juego existente sin registros devuelve cero participantes, un videojuego y cero puntuaciones.

### Fechas y zona horaria

`APP_TIME_ZONE` vacío usa la zona local del sistema donde se ejecuta Node; puede indicarse una zona IANA explícita. Se escribe DATETIME local directamente en las columnas de negocio, sin depender del reloj/zona de Railway. La API devuelve esas fechas como texto SQL sin `Z`; React debe presentarlas como hora local acordada y evitar interpretarlas automáticamente como UTC.

El esquema DATETIME no almacena zona ni offset. Verifica con BD el significado de las fechas históricas antes de mezclarlas con nuevas. No se convierten registros anteriores. Mantén la misma zona configurada en todas las instancias. Si el equipo requiere guardar UTC, esa migración debe ser una decisión explícita.

### Idempotencia

Solo POST `/api/puntuaciones` exige la clave. Está acotada por ID estable de usuario (`usuario:<ID>`) y operación; se compara el hash del cuerpo validado y normalizado. Distintos órdenes de propiedades JSON no generan conflictos. Una misma clave con otro cuerpo devuelve 409.

La reserva, la inserción de puntuación y el resultado se confirman juntos en una transacción. Los reintentos concurrentes esperan el índice único y recuperan el resultado confirmado. Si falla la operación antes del commit, se revierte también la reserva.

Las respuestas se conservan sin caducidad automática para este reto. Si luego se edita o elimina la puntuación, un reintento antiguo devuelve la respuesta ORIGINAL y no recrea ni revierte el registro. No borres `api_solicitudes` mientras necesites conservar esa garantía. PATCH/DELETE no cuentan con almacenamiento de respuestas idempotentes.

## 9. Integración con React/Vite

Frontend de desarrollo autorizado: `http://localhost:5173`, configurable. CORS permite Authorization, Content-Type e Idempotency-Key, y expone Idempotency-Replayed y X-Request-Id. OPTIONS se atiende antes de autenticar.

React debe enviar las credenciales HTTP Basic de una cuenta de usuarios en cada escritura y al consultar /api/auth/me. Las lecturas de negocio son públicas y pueden omitir Authorization. Conservarlas solo en memoria durante la sesión de uso; no incluirlas en el código compilado, variables VITE, URL ni localStorage. Esto es HTTP Basic, no una sesión de servidor. Para logout, React descarta sus credenciales; HTTP Basic no ofrece una revocación de sesión por navegador.

Para una nueva intención de registrar una puntuación, React genera `crypto.randomUUID()` una sola vez y conserva esa clave y el mismo cuerpo durante todos los reintentos. Debe reutilizar la operación pendiente ante doble clic y mantener el botón deshabilitado mientras se resuelve. Dos claves diferentes son dos operaciones válidas: el backend no puede deducir que representan el mismo clic.

Vite y backend usan procesos separados en localhost. Si Vite inicia en 5174 por estar ocupado 5173, corrige FRONTEND_ORIGIN o acuerda un puerto fijo con frontend. Si el navegador corre en otra computadora, localhost cambia de significado y se debe configurar la conectividad expresamente.

## 10. Clean Architecture aplicada

- domain valida reglas sin Express/MySQL.
- services recibe repositorios por constructor y coordina casos de uso; no importa mysql2.
- repositories ejecuta SQL sobre las entidades reales.
- controllers traduce HTTP a llamadas de servicios.
- routes declara los endpoints.
- container conecta las implementaciones.
- app configura HTTP; server administra recursos y escucha en 3000.

La autenticación, el reloj y el pool son detalles externos. Los contratos están documentados en `src/contracts/repositories.js`. JSDoc ayuda a documentar JavaScript; no reemplaza la validación en ejecución ni un compilador de tipos.

No se necesita Babel, TypeScript, Nest CLI, Pug, nodemon ni un ORM para ejecutar esta entrega.

## 11. Pruebas y evidencia

```bash
npm test
```

Se verificaron **18 pruebas unitarias y HTTP con Node 24.21.0 y npm 11.19.0**. HTTP levanta Express real en puerto efímero, pero utiliza repositorios sustitutos. Comprueban consultas públicas, la matriz de roles en POST/PATCH/DELETE, alta exclusiva de Administradores, rechazo de IdRol del cliente, ausencia de hashes en respuestas, autenticación desde repositorio, validaciones, errores, CORS e idempotencia. No prueban el SQL ni concurrencia contra MySQL real.

Se incluye una suite adicional para MySQL:

1. Crear una base EXCLUSIVA cuyo nombre termine en `_test`.
2. Aplicar en ella `database/schema_nueva.sql` y las migraciones 001 y 003.
3. Copiar `.env.test.example` a `.env.test`, configurar la conexión de pruebas.
4. Ejecutar `npm run test:mysql`.

La suite se niega a correr si falta RUN_MYSQL_TESTS=true o si el nombre no termina en `_test`. Crea datos identificados con un UUID y elimina solamente sus propios registros al terminar; una interrupción abrupta puede dejar esos datos de prueba. Comprueba concurrencia idempotente real, rollback, clasificación, promedio, FK y cambios de asociados.

**No se ejecutó esa suite ni se conectó a la base Railway del equipo**, porque no están disponibles sus credenciales reales. La entrega incluye el código, no una certificación de sus tablas/índices/TLS. QA debe completar la revisión en MySQL y React conforme al Markdown.

## 12. Security Note

Se respetó el uso de root indicado por el usuario. Tiene privilegios amplios; las credenciales deben estar exclusivamente en el backend. El ejemplo de conexión deja DB_SSL=false porque el soporte TLS del proveedor no fue confirmado. Para una conexión cifrada, confirmar TLS/certificado con Railway y activar DB_SSL=true, opcionalmente DB_SSL_CA_FILE. No desactivar la validación de certificados.

HTTP Basic codifica credenciales; no las cifra. Esta configuración escucha en loopback para desarrollo local. Antes de exponerla fuera de localhost, configurar HTTPS y revisar el mecanismo de acceso. CORS no sustituye autenticación ni autorización. Los permisos se comprueban en el backend por rol. El frontend puede ocultar botones, pero eso no sustituye los controles del servidor. Correo y contraseña usados para autenticarse no se aceptan como una declaración de rol; el rol se obtiene de MySQL.

Se aplica un límite de 300 solicitudes por minuto e IP a rutas protegidas. Su almacenamiento es local al proceso; para varias instancias se requiere un almacén compartido. La garantía idempotente sí reside en MySQL y está diseñada para múltiples instancias. Cada solicitud verifica scrypt; para mayor volumen conviene migrar a sesiones/tokens acordados con el equipo.

## Fuentes técnicas

- https://expressjs.com/en/guide/error-handling/
- https://expressjs.com/en/resources/middleware/cors/
- https://sidorares.github.io/node-mysql2/docs
- https://nodejs.org/api/crypto.html

## 13. Alta de Administrador y cambios de código

POST `/api/usuarios`, autenticado con el Correo/contraseña del Superadministrador:

```json
{
  "nombre": "Administrador del torneo",
  "correo": "admin@example.com",
  "contrasena": "UsaUnaClavePropiaLarga#2026"
}
```

No enviar ID, IdRol, Rol, passwordHash ni Contraseña como nombre del campo del cuerpo. Los nombres del JSON son nombre/correo/contrasena; el repositorio los mapea a Nombre/Correo/Contraseña de MySQL. El rol Administrador se resuelve en el servidor por su nombre, no por un ID fijo. Devuelve 201 con ID, Nombre, Correo, IdRol y Rol; nunca devuelve la contraseña ni su hash. Correo se normaliza a minúsculas al registrar y autenticar.

Cambios principales: app.js retira autenticación global; auth.middleware.js recibe AuthService; authorize.middleware.js aplica roles; cada router protege solo sus escrituras; usuarios.controller.js delega a UsuariosService; ese servicio vuelve a comprobar Superadministrador y fija la operación de alta. Los controladores CRUD existentes se conservan, salvo puntuaciones.controller.js que utiliza req.auth.id para idempotencia.

La autenticación se mantiene en cada solicitud protegida y lee el rol vigente en MySQL. Si el usuario se elimina o cambia su rol, la siguiente solicitud refleja ese cambio. No hay endpoints de administración de roles, eliminación de cuentas ni creación de Superadministradores por HTTP.

Los hashes nuevos usan scrypt con N=16384, r=8, p=5, salt aleatoria y parámetros incluidos en el hash. El verificador admite el formato anterior únicamente para hashes previamente generados; los hashes nuevos usan el perfil actualizado. Ninguna contraseña se guarda en texto plano. No existe un endpoint público de registro de usuarios.

Para incorporar esta versión, usar una rama como feature/usuarios-roles y coordinar tablas/cuenta inicial/mapeo idempotente antes de habilitar el nuevo tráfico. El equipo debe completar pruebas con MySQL real; no se simuló una migración ni un aprovisionamiento en su servidor.
