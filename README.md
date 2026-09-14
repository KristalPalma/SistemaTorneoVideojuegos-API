# API de torneo · Express + JavaScript

Implementación del backend para jugadores, videojuegos, puntuaciones, clasificación y estadísticas. Puerto predeterminado: **3000**, host `127.0.0.1`.

Esta API contiene 21 endpoints de negocio, GET, POST y DELETE para Jugadores, Videojuegos y Puntuaciones, POST /api/usuarios para crear Administradores, autenticación HTTP Basic contra MySQL, salud del servicio, validación, consultas parametrizadas y protección persistente contra reintentos de creación de puntuaciones.

## 1. Instalar

En la raíz del backend:

```bash
npm ci
```

Copiar configuración:

```bash
cp .env.example .env
```

O en Powershell:

```
Copy-Item .env.example .env
```

## 2. Configurar MySQL y autenticación por usuarios

Configurar correctamente los valores DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD en `.env`. `PORT=3000`, `HOST=127.0.0.1` y FRONTEND_ORIGIN.

La autenticación HTTP Basic recibe **Correo y contraseña original** y consulta usuarios con JOIN roles en cada solicitud protegida. No se implementó JWT ni una sesión/cookie para mayor simplicidad.

Acciones por Rol:
Superadministrador crea Administradores y registra, modifica o elimina videojuegos.
Administrador registra, modifica o elimina jugadores y puntuaciones.

No se heredan permisos entre roles. Todo visitante puede consultar los GET para ver información. `/api/auth/me` requiere autenticación.

## 3. Arrancar en el puerto 3000

```bash
npm run dev
```

Sin observar cambios:

```bash
npm start
```

El servidor valida configuración, versión, presencia de tablas e InnoDB antes de escuchar. Si falta la migración o hay un error de conexión, termina con código 1, no simula conexión satisfactoria.

Abrir:

`http://localhost:3000/api/health`

Respuesta:

```json
{ "status": "ok" }
```

`/api/health` comprueba que el proceso está vivo. `GET /api/health/ready`, con autenticación, comprueba también MySQL. La raíz `/` no tiene endpoint y devuelve 404.

## 4. Endpoints y contratos

Los GET de jugadores, videojuegos, puntuaciones, clasificación y estadísticas son públicos. POST/PATCH/DELETE requieren el rol correspondiente.

| Método | Ruta | Resultado / RF |
| --- | --- | --- |
| POST | `/api/jugadores` | Crear jugador, 201 satisfactorio · RF01 |
| GET | `/api/jugadores?buscar=Shadow&page=1&limit=20` | Listar/buscar por nombre OR gamertag · RF04/RF05/RF07 |
| GET | `/api/jugadores/:id` | Consultar jugador |
| PATCH | `/api/jugadores/:id` | Actualizar campos enviados |
| DELETE | `/api/jugadores/:id` | Eliminar, 204 satisfactorio o 409 si tiene puntuaciones |
| POST | `/api/videojuegos` | Crear videojuego, 201 satisfactorio · RF02 |
| GET | `/api/videojuegos?page=1&limit=20` | Catálogo para RF05 |
| GET | `/api/videojuegos/:id` | Consultar videojuego |
| PATCH | `/api/videojuegos/:id` | Actualizar campos enviados |
| DELETE | `/api/videojuegos/:id` | Eliminar, 204 satisfactorio o 409 si tiene puntuaciones |
| POST | `/api/puntuaciones` | Crear con Idempotency-Key, 201 satisfactorio · RF03/RF05 |
| GET | `/api/puntuaciones?ID_jugador=1&ID_videojuego=1` | Historial con filtros opcionales y paginación |
| GET | `/api/puntuaciones/:id` | Consultar puntuación |
| PATCH | `/api/puntuaciones/:id` | Modificar puntuación y/o asociados |
| DELETE | `/api/puntuaciones/:id` | Eliminar, 204 satisfactorio |
| GET | `/api/clasificacion?ID_videojuego=1` | Clasificación del videojuego obligatorio · RF06 |
| GET | `/api/estadisticas?ID_videojuego=1` | Estadísticas globales si no hay filtro · RF08 |
| POST | `/api/usuarios` | Crear un Administrador, solo Superadministrador |
| GET | `/api/auth/me` | Obtener ID, nombre, correo y rol de la cuenta autenticada |
| GET | `/api/health` | Estado del proceso, público |
| GET | `/api/health/ready` | Comprobar MySQL, solo Superadministrador |

Listados: `page` predeterminado 1, máximo 10000, `limit` predeterminado 20, máximo 100. Orden `ID DESC`, excepto clasificación. Búsqueda parcial: `%`, `_` y `!` escritos por el usuario se tratan como caracteres literales, no SQL.

El JSON conserva los nombres del esquema: `ID`, `ID_jugador`, `ID_videojuego`, `fecha_registro`, etc.

### EJEMPLOS.

Consulta GET a api/jugadores

```json
{ "data": [...], "pagination": { "page": 1, "limit": 20 } }
```

consulta GET individual a api/jugadores/:id
```json
{ "data": { "id": 1, "nombre": "Juan", "gamertag": "XxJuanito360xX", "correo": "Juanito360@example.com", "fecha": "2026-09-12 12:00:00"} }
```

Registro POST individual a api/jugadores

```json
{ "nombre": "Juan", "gamertag": "XxJuanito360xX", "correo": "Juanito360@example.com" }
```

Ejemplo error al mandar DELETE individual a api/jugadores/:id

```json
{ "error": { "code": "RELATED_RECORDS", "message": "No se puede eliminar: existen puntuaciones relacionadas." }, "requestId": "..." }
```

Códigos: 400 validación, 401 credenciales, 403 sin permisos, 404 inexistente, 409 duplicado/conflicto/referencias al eliminar, 413 cuerpo grande, 422 asociado inexistente, 429 límite de tráfico, 503 conflicto temporal de transacción y 500 error inesperado. Los errores no datos sensibles.

## 5. Probar en Postman

Para escrituras, configura Authorization → Basic Auth: el Correo de un usuario registrado y su contraseña original. Usa Superadministrador para videojuegos o alta de usuarios, y Administrador para jugadores o puntuaciones. Los GET de negocio no necesitan Authorization. El cuerpo debe estar en Body → raw → JSON.

POST `/api/jugadores`:

```json
{ "nombre": "nombre", "gamertag": "gamertag", "correo": "correo@example.com" }
```

POST `/api/videojuegos`:

```json
{ "nombre": "nombre", "genero": "genero" }
```

POST `/api/puntuaciones`, usando los IDs REALES devueltos:

```json
{ "ID_jugador": 1, "ID_videojuego": 1, "puntuacion": 950 }
```

Agregar el header `Idempotency-Key` con un UUID de esa operación. Repetir la solicitud con la misma clave y mismos datos devuelve la misma puntuación, el header `Idempotency-Replayed` cambia a `true`. Utilizar otra clave para una participación nueva, aunque el puntaje sea idéntico.

PATCH `/api/puntuaciones/1` permite, por ejemplo:

```json
{ "ID_jugador": 2, "ID_videojuego": 1, "puntuacion": 1000 }
```

Incluye solamente los campos que quieras cambiar. No admite ID de registro, fechas, null, campos extra ni cuerpo vacío.

## 6. Reglas implementadas

- Obligatorios y longitudes iguales al esquema. Se recortan espacios en textos.
- Gamertag, correo y nombre de videojuego únicos por sus restricciones MySQL.
- Puntuaciones recibe enteros. No se convierte strings numéricos. Referencias garantizadas por claves foráneas, también al editar.
- Eliminar jugadores o videojuegos con puntuaciones devuelve 409, no hay cascada.
- Ediciones serializadas con transacciones y bloqueo de fila. Si dos solicitudes editan el mismo campo, prevalece la que se ejecuta después, no se implementa control de versión optimista.
- Fechas automáticas al crear y conservadas al editar. Modificar una puntuación cambia el ranking según su valor actual y su fecha original.
- Clasificación: exige un videojuego existente. Selecciona la mayor puntuación por jugador y, entre máximos iguales del mismo jugador, el registro más antiguo. Orden final: puntaje descendente, fecha ascendente, ID ascendente. Posiciones consecutivas 1,2,3, se calculan antes de paginar. Los registros históricos con fecha NULL se colocan después de los que sí tienen fecha para el mismo puntaje.
- Estadísticas globales: total de las tablas y AVG de todas las puntuaciones. Filtradas: participantes distintos de ese juego, un videojuego, cantidad de registros y su promedio. Sin puntuaciones: promedio null. Un videojuego inexistente produce 404, un juego existente sin registros devuelve cero participantes, un videojuego y cero puntuaciones.

### Fechas y zona horaria

`APP_TIME_ZONE` vacío usa la zona local del sistema donde se ejecuta Node, puede indicarse una zona explícita. Se escribe DATETIME local directamente en las columnas de negocio, sin depender del reloj/zona de la BD. La API devuelve esas fechas como texto SQL sin `Z`.

El esquema DATETIME no almacena zona ni offset. Verifica con BD el significado de las fechas históricas antes de mezclarlas con nuevas. No se convierten registros anteriores. Mantén la misma zona configurada en todas las instancias. Si el equipo requiere guardar UTC, esa migración debe ser una decisión explícita.

### Idempotencia

Solo POST `/api/puntuaciones` exige la clave. Está acotada por ID estable de usuario (`usuario:<ID>`) y operación, se compara el hash del cuerpo validado y normalizado. Distintos órdenes de propiedades JSON no generan conflictos. Una misma clave con otro cuerpo devuelve 409.

La reserva, la inserción de puntuación y el resultado se confirman juntos en una transacción. Los reintentos concurrentes esperan el índice único y recuperan el resultado confirmado. Si falla la operación antes del commit, se revierte también la reserva.

## 7. Integración con React/Vite

Frontend de desarrollo autorizado: `http://localhost:5173`, configurable. CORS permite Authorization, Content-Type e Idempotency-Key, y expone Idempotency-Replayed y X-Request-Id. OPTIONS se atiende antes de autenticar.

Frontend debe enviar las credenciales HTTP Basic de una cuenta de usuarios en cada escritura y al consultar /api/auth/me. Las lecturas de negocio son públicas y pueden omitir Authorization. Conservarlas solo en memoria durante la sesión de uso, no incluirlas en el código compilado, variables VITE, URL ni localStorage. Esto es HTTP Basic, no una sesión de servidor. Para logout, el Front descarta sus credenciales, HTTP Basic no ofrece una revocación de sesión por navegador.

Para una nueva intención de registrar una puntuación, React debe generar `crypto.randomUUID()` una sola vez y conserva esa clave y el mismo cuerpo durante todos los reintentos. Debe reutilizar la operación pendiente ante doble clic y mantener el botón deshabilitado mientras se resuelve. Dos claves diferentes son dos operaciones válidas: el backend no puede deducir que representan el mismo clic.

## 8. Clean Architecture aplicada

- domain valida reglas sin Express/MySQL.
- services recibe repositorios por constructor y coordina casos de uso.
- repositories ejecuta SQL sobre las entidades reales.
- controllers traduce HTTP a llamadas de servicios.
- routes declara los endpoints.
- container conecta las implementaciones.
- app configura HTTP, server administra recursos y escucha en 3000.

Los contratos están documentados en `src/contracts/repositories.js`. Se utiliza JSDoc para documentar JavaScript.

## 9. Pruebas y evidencia

```bash
npm test
```

Se verificaron **18 pruebas unitarias y HTTP**. HTTP levanta Express real en puerto efímero, pero utiliza repositorios sustitutos. Comprueban consultas públicas, la matriz de roles en POST/PATCH/DELETE, alta exclusiva de Administradores, rechazo de ID_Rol del cliente, ausencia de hashes en respuestas, autenticación desde repositorio, validaciones, errores, CORS e idempotencia. No prueban el SQL ni concurrencia contra MySQL real.

## 10. Security Note

HTTP Basic codifica credenciales, no las cifra. Esta configuración escucha en loopback para desarrollo local. Antes de exponerla fuera de localhost, configurar HTTPS y revisar el mecanismo de acceso. CORS no sustituye autenticación ni autorización. Los permisos se comprueban en el backend por rol. El frontend puede ocultar botones, pero eso no sustituye los controles del servidor. Correo y contraseña usados para autenticarse no se aceptan como una declaración de rol, pues el rol se obtiene de MySQL.

Se aplica un límite de 300 solicitudes por minuto e IP a rutas protegidas. La garantía idempotente reside en MySQL y está diseñada para múltiples instancias. Cada solicitud verifica scrypt, para mayor volumen conviene migrar a sesiones/tokens acordados con el equipo.