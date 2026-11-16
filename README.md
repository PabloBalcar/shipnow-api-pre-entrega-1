# ShipNow API

API REST de logística y envíos construida con Node.js, Express y MongoDB (Mongoose), organizada en **arquitectura por capas** (Router → Controller → Service → Repository).

## Cómo correr el proyecto localmente

### 1. Instalar dependencias

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

### 2. Configurar las variables de entorno

Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Configurar las siguientes variables:

```env
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
NODE_ENV=development
```

Las tres variables son **obligatorias**.

`NODE_ENV` acepta los siguientes valores:

- `development`
- `test`
- `production`

Si falta alguna variable obligatoria o su valor es inválido, la aplicación no inicia y muestra un error descriptivo.

### 3. Levantar el servidor

En modo desarrollo:

```bash
npm run dev
```

En modo normal:

```bash
npm start
```

### 4. Verificar el funcionamiento

Realizar una petición:

```http
GET http://localhost:8080/health
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "API funcionando"
}
```

---

## Arquitectura

El proyecto utiliza una arquitectura por capas para separar responsabilidades y facilitar el mantenimiento.

```text
src/
├── config/
│   ├── env.config.js
│   ├── db.js
│   └── logger.js
├── constants/
│   ├── index.js
│   └── errors.js
├── controllers/
│   ├── mocks.controller.js
│   ├── logger.controller.js
│   └── ...
├── middlewares/
│   └── error.middleware.js
├── models/
│   ├── delivery.model.js
│   └── ...
├── repositories/
│   ├── mocks.repository.js
│   └── ...
├── routes/
│   ├── mocks.router.js
│   ├── logger.router.js
│   └── ...
├── services/
│   ├── mocks.service.js
│   └── ...
├── utils/
│   ├── app-error.js
│   └── mock-generator.js
├── app.js
└── server.js
```

### Flujo de una petición

```text
Request → Router → Controller → Service → Repository → Model / MongoDB
```

Las entidades principales son **Users, Products, Stores, Orders y Deliveries**.

### Responsabilidades de cada capa

**Controller**

Es la puerta de entrada HTTP. Recibe los datos de la petición, llama al Service correspondiente y devuelve la respuesta con su código de estado. Los errores se derivan al middleware global mediante `next(error)`.

**Service**

Contiene la lógica de negocio. No depende de Express ni realiza consultas directas a MongoDB. También valida las reglas de negocio y lanza errores personalizados cuando corresponde.

**Repository**

Se encarga del acceso a los datos mediante los modelos de Mongoose. Encapsula las consultas y operaciones sobre la base de datos.

**Middleware**

Centraliza el tratamiento de errores y transforma las excepciones recibidas en respuestas HTTP con un formato uniforme.

### ¿Por qué separar Service y Repository?

El Repository se ocupa de **cómo se accede a los datos**, mientras que el Service define **qué reglas de negocio se deben aplicar**.

Esta separación permite modificar la forma de almacenar los datos sin alterar las reglas del negocio, y cambiar las reglas sin modificar las consultas a la base de datos.

---

## Configuración y constantes

Las variables de entorno se centralizan en `src/config/env.config.js`.

La aplicación valida:

- Que existan `PORT`, `MONGODB_URI` y `NODE_ENV`.
- Que `PORT` sea un número entero positivo.
- Que `NODE_ENV` tenga un valor permitido.

Las constantes del dominio se encuentran en `src/constants/index.js` y utilizan `Object.freeze()` para evitar modificaciones accidentales.

El diccionario de errores se encuentra en `src/constants/errors.js` y centraliza los códigos, mensajes y estados HTTP asociados a los errores de la aplicación.

### Roles de usuario

```text
ADMIN
USER
COURIER
```

- `ADMIN`: administrador del sistema.
- `USER`: usuario o cliente.
- `COURIER`: repartidor.

### Estados de pedidos

```text
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Prioridades de entrega

```text
low
normal
high
```

### Estados de entregas

```text
pending
assigned
in_transit
delivered
cancelled
```

### Estados de productos

```text
available
out_of_stock
```

---

## Funcionamiento de la API

ShipNow API trabaja con usuarios, comercios, productos, pedidos y entregas.

Un usuario representa a un cliente, un comercio es el lugar desde donde sale el pedido, y un pedido es una solicitud de envío asociada a un usuario y a un comercio.

Las entregas se relacionan con los pedidos y pueden tener asignado un repartidor con rol `COURIER`.

### Flujo principal

1. Crear un usuario.
2. Crear un comercio.
3. Crear un pedido utilizando el ID del usuario y del comercio.
4. Consultar los pedidos.
5. Crear y gestionar entregas asociadas a pedidos.
6. Actualizar los estados correspondientes.

---

## Users

Representa a los usuarios del sistema.

### Campos principales

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "USER"
}
```

Roles disponibles: `ADMIN`, `USER` y `COURIER`.

El rol predeterminado es `USER`.

### Endpoints

```http
GET    /api/users
GET    /api/users/:uid
POST   /api/users
PUT    /api/users/:uid
DELETE /api/users/:uid
```

---

## Products

Cada producto pertenece a un comercio y tiene un stock y un estado.

Los estados disponibles son `available` y `out_of_stock`, determinados automáticamente según el stock.

### Endpoints

```http
GET    /api/products
GET    /api/products?includeOutOfStock=true
GET    /api/products?store=ID_DEL_COMERCIO
GET    /api/products/:pid
POST   /api/products
PUT    /api/products/:pid
DELETE /api/products/:pid
```

Por defecto, el listado muestra solamente productos con stock disponible. El parámetro `includeOutOfStock=true` permite incluir todos los productos.

### Crear producto

```http
POST /api/products
```

Body de ejemplo:

```json
{
  "name": "Caja mediana",
  "description": "Caja de cartón 30x30",
  "price": 1500,
  "stock": 20,
  "store": "ID_DEL_COMERCIO"
}
```

---

## Stores

Representa los comercios registrados en el sistema.

### Endpoints

```http
GET    /api/stores
GET    /api/stores/:sid
POST   /api/stores
PUT    /api/stores/:sid
DELETE /api/stores/:sid
```

### Crear comercio

```http
POST /api/stores
```

Body de ejemplo:

```json
{
  "name": "Kiosco Centro",
  "address": "Av. Siempre Viva 742",
  "owner": "ID_DEL_USUARIO"
}
```

---

## Orders

Representa los pedidos o envíos realizados por los usuarios.

### Endpoints

```http
GET    /api/orders
GET    /api/orders/:oid
POST   /api/orders
PUT    /api/orders/:oid/status
DELETE /api/orders/:oid
```

### Crear pedido

```http
POST /api/orders
```

Body de ejemplo:

```json
{
  "customer": "ID_DEL_USUARIO",
  "store": "ID_DEL_COMERCIO",
  "deliveryAddress": "Av. Siempre Viva 742",
  "items": [
    {
      "name": "Caja mediana",
      "quantity": 2,
      "price": 1500
    },
    {
      "name": "Sobre chico",
      "quantity": 1,
      "price": 800
    }
  ]
}
```

El total se calcula automáticamente:

```text
2 unidades x $1500 = $3000
1 unidad x $800 = $800

Total = $3800
```

El pedido se crea inicialmente con estado `created`.

### Actualizar estado del pedido

```http
PUT /api/orders/:oid/status
```

Body de ejemplo:

```json
{
  "status": "in_transit"
}
```

---

## Deliveries

Representa las entregas asociadas a los pedidos.

Cada entrega tiene una referencia a un pedido y puede tener asignado un repartidor (`courier`) con rol `COURIER`.

### Campos principales

- `order`: referencia al pedido asociado.
- `courier`: referencia al repartidor asignado. Puede ser `null`.
- `status`: estado de la entrega.
- `deliveredAt`: fecha de entrega, cuando corresponde.

### Estados disponibles

```text
pending
assigned
in_transit
delivered
cancelled
```

---

## Mocking y carga de datos de prueba

El proyecto incorpora un sistema de mocking utilizando **@faker-js/faker** para generar datos ficticios de usuarios, repartidores, comercios, pedidos y entregas.

La lógica de generación está separada en las siguientes capas:

- `utils/mock-generator.js`: genera los datos ficticios.
- `services/mocks.service.js`: coordina la generación, validación y relaciones entre entidades.
- `repositories/mocks.repository.js`: realiza las inserciones en MongoDB.
- `controllers/mocks.controller.js`: gestiona las solicitudes HTTP.
- `routes/mocks.router.js`: define los endpoints bajo `/api/mocks`.

### Generar datos ficticios sin guardarlos

Los siguientes endpoints permiten obtener datos simulados sin insertarlos en MongoDB.

```http
GET /api/mocks/users?qty=2
GET /api/mocks/couriers?qty=2
GET /api/mocks/orders?qty=2
GET /api/mocks/deliveries?qty=2
```

El parámetro `qty` indica la cantidad de registros a generar.

- Si no se especifica, se generan 5 registros.
- Se permite una cantidad entre 1 y 100.
- Si la cantidad es inválida, se devuelve un error HTTP 400.

Ejemplo:

```http
GET http://localhost:8080/api/mocks/users?qty=2
```

Respuesta de ejemplo:

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "ID_GENERADO",
      "firstName": "Martina",
      "lastName": "Gómez",
      "email": "martina@example.com",
      "role": "USER",
      "documents": []
    }
  ]
}
```

Las contraseñas no se incluyen en las respuestas de generación de usuarios y repartidores.

Los pedidos y las entregas generados incluyen referencias a las entidades relacionadas.

### Insertar datos de prueba en MongoDB

Para insertar datos ficticios en la base de datos se utiliza:

```http
POST /api/mocks/seed?qty=2
```

Este endpoint genera e inserta:

- Usuarios con rol `USER`.
- Repartidores con rol `COURIER`.
- Comercios asociados a usuarios.
- Pedidos asociados a usuarios y comercios.
- Entregas asociadas a pedidos y repartidores.

Las referencias se generan antes de realizar las inserciones, permitiendo mantener la relación entre los documentos.

Respuesta esperada:

```json
{
  "status": "success",
  "payload": {
    "insertados": {
      "usuarios": 2,
      "repartidores": 2,
      "comercios": 2,
      "pedidos": 2,
      "entregas": 2
    }
  }
}
```

El endpoint devuelve HTTP `201` cuando la inserción se realiza correctamente.

**Importante:** cada ejecución del seed genera nuevos registros. No elimina los datos existentes. Las inserciones se realizan secuencialmente y no utilizan transacciones; si una operación intermedia falla, las inserciones anteriores podrían permanecer guardadas.

### Probar los endpoints con Thunder Client

Con el servidor ejecutándose en el puerto `8080`, se pueden probar las siguientes solicitudes:

| Método | Endpoint                      | Función                               |
| ------ | ----------------------------- | ------------------------------------- |
| GET    | `/api/mocks/users?qty=2`      | Genera usuarios ficticios             |
| GET    | `/api/mocks/couriers?qty=2`   | Genera repartidores ficticios         |
| GET    | `/api/mocks/orders?qty=2`     | Genera pedidos ficticios              |
| GET    | `/api/mocks/deliveries?qty=2` | Genera entregas ficticias             |
| POST   | `/api/mocks/seed?qty=2`       | Inserta datos relacionados en MongoDB |

---

## Manejo profesional de errores

El proyecto implementa un sistema centralizado de manejo de errores para mantener respuestas HTTP consistentes y evitar que cada controlador tenga que construir sus propias respuestas de error.

### Componentes principales

- `utils/app-error.js`: define la clase `AppError`, utilizada para crear errores personalizados de la aplicación.
- `constants/errors.js`: contiene el diccionario centralizado de errores, con sus códigos internos, mensajes y estados HTTP.
- `middlewares/error.middleware.js`: recibe los errores y genera la respuesta HTTP correspondiente.
- `app.js`: deriva las rutas inexistentes al middleware global y registra el middleware de errores al final de la configuración de Express.

### Flujo de manejo de errores

```text
Request
   ↓
Router
   ↓
Controller
   ↓
Service
   ↓
AppError / Error de Mongoose
   ↓
next(error)
   ↓
Error Middleware
   ↓
Respuesta HTTP uniforme
```

Los errores de negocio se detectan principalmente en los Services. Los Controllers capturan las excepciones y las derivan mediante `next(error)`, sin construir respuestas de error por separado.

### Formato de respuesta

Todas las respuestas de error siguen esta estructura:

```json
{
  "status": "error",
  "statusCode": 400,
  "error": "INVALID_MOCK_AMOUNT",
  "message": "La cantidad debe ser un número entero entre 1 y 100"
}
```

El campo `details` es opcional y se utiliza cuando es necesario proporcionar información adicional sobre el error.

### Códigos HTTP utilizados

| Código HTTP | Descripción                                                          |
| ----------- | -------------------------------------------------------------------- |
| `400`       | Datos inválidos, identificadores incorrectos o validaciones fallidas |
| `404`       | Recurso o ruta inexistente                                           |
| `409`       | Conflicto por un recurso duplicado                                   |
| `500`       | Error interno del servidor o problema de base de datos               |

### Errores personalizados

Algunos de los errores definidos en el diccionario `ERRORS` son:

| Código interno          | HTTP | Descripción                                  |
| ----------------------- | ---: | -------------------------------------------- |
| `USER_NOT_FOUND`        |  404 | Usuario no encontrado                        |
| `STORE_NOT_FOUND`       |  404 | Comercio no encontrado                       |
| `PRODUCT_NOT_FOUND`     |  404 | Producto no encontrado                       |
| `ORDER_NOT_FOUND`       |  404 | Pedido no encontrado                         |
| `INVALID_MOCK_AMOUNT`   |  400 | Cantidad de mocks inválida                   |
| `INVALID_ORDER_STATUS`  |  400 | Estado de pedido inválido                    |
| `INVALID_PRODUCT_STOCK` |  400 | Stock de producto inválido                   |
| `INVALID_ID`            |  400 | Identificador con formato incorrecto         |
| `VALIDATION_ERROR`      |  400 | Error de validación de Mongoose              |
| `DUPLICATE_RESOURCE`    |  409 | Registro duplicado                           |
| `DATABASE_ERROR`        |  500 | Error de interacción con MongoDB             |
| `MOCK_GENERATION_ERROR` |  500 | Error durante la generación o carga de mocks |
| `ROUTE_NOT_FOUND`       |  404 | Ruta inexistente                             |
| `INTERNAL_SERVER_ERROR` |  500 | Error interno no identificado                |

### Errores de Mongoose

El middleware también contempla errores generados por Mongoose y MongoDB:

- `ValidationError`: errores de validación de documentos.
- `CastError`: identificadores o valores con formato incorrecto.
- Código `11000`: conflictos por valores duplicados.
- Errores de conexión o comunicación con MongoDB/Mongoose.

En los errores de validación se pueden incluir detalles sobre los campos que no cumplen las reglas establecidas.

En producción, los errores internos con estado HTTP 500 se reemplazan por un mensaje genérico para evitar exponer información técnica.

### Probar el manejo de errores

Se pueden reproducir distintos casos utilizando Thunder Client.

**1. Cantidad igual a cero**

```http
GET http://localhost:8080/api/mocks/users?qty=0
```

Resultado esperado: HTTP `400`, código `INVALID_MOCK_AMOUNT`.

**2. Cantidad negativa**

```http
GET http://localhost:8080/api/mocks/users?qty=-3
```

Resultado esperado: HTTP `400`, código `INVALID_MOCK_AMOUNT`.

**3. Cantidad no numérica**

```http
GET http://localhost:8080/api/mocks/users?qty=abc
```

Resultado esperado: HTTP `400`, código `INVALID_MOCK_AMOUNT`.

**4. Cantidad superior al máximo permitido**

```http
GET http://localhost:8080/api/mocks/users?qty=101
```

Resultado esperado: HTTP `400`, código `INVALID_MOCK_AMOUNT`.

**5. Cantidad válida**

```http
GET http://localhost:8080/api/mocks/users?qty=3
```

Resultado esperado: HTTP `200`, con tres usuarios generados y sin contraseñas expuestas.

**6. Seed de datos de prueba**

```http
POST http://localhost:8080/api/mocks/seed?qty=2
```

Resultado esperado: HTTP `201`, con dos registros insertados por cada colección.

**7. Ruta inexistente**

```http
GET http://localhost:8080/api/ruta-inexistente
```

Resultado esperado: HTTP `404`, código `ROUTE_NOT_FOUND`.

**8. Identificador inválido**

```http
GET http://localhost:8080/api/users/123
```

Resultado esperado: HTTP `400`, código `INVALID_ID`.

**9. Usuario inexistente**

```http
GET http://localhost:8080/api/users/507f1f77bcf86cd799439011
```

Resultado esperado: HTTP `404`, código `USER_NOT_FOUND`.

---

## Sistema de logging y monitoreo

El proyecto incorpora **Winston** para registrar eventos importantes, solicitudes HTTP y errores durante la ejecución de la API.

La configuración se centraliza en `src/config/logger.js`, permitiendo utilizar el mismo logger desde los distintos componentes de la aplicación.

### Dependencias utilizadas

- `winston`: gestión y clasificación de registros.
- `winston-daily-rotate-file`: almacenamiento y rotación automática de archivos de log.

### Niveles personalizados

Se definen seis niveles de logging, ordenados de menor a mayor gravedad:

| Nivel     | Descripción                                                        |
| --------- | ------------------------------------------------------------------ |
| `debug`   | Información detallada para depuración.                             |
| `http`    | Registro de solicitudes HTTP.                                      |
| `info`    | Eventos importantes del funcionamiento normal.                     |
| `warning` | Situaciones anormales o errores controlados.                       |
| `error`   | Errores inesperados de la aplicación.                              |
| `fatal`   | Fallas críticas que pueden impedir el funcionamiento del servidor. |

### Comportamiento según el entorno

El nivel mínimo de registro depende de la variable `NODE_ENV`:

- **Development:** registra desde `debug`, incluyendo todos los niveles.
- **Test:** registra desde `debug`.
- **Production:** registra desde `info`, excluyendo `debug` y `http`.

Los registros se muestran en consola y también se almacenan en archivos.

### Eventos registrados

El logger está integrado en distintos componentes:

- `server.js`: registra el inicio del servidor y los errores críticos de inicialización.
- `config/db.js`: registra la conexión exitosa o fallida con MongoDB.
- `app.js`: registra solicitudes HTTP, incluyendo método, ruta, código de estado y duración.
- `middlewares/error.middleware.js`: registra errores controlados y errores inesperados.
- `services/mocks.service.js`: registra la generación y carga de datos ficticios, además de las cantidades inválidas.
- `services/orders.service.js`: registra la creación de pedidos y los pedidos inexistentes.

Los registros evitan incluir contraseñas, credenciales y otros datos sensibles.

### Almacenamiento y rotación de archivos

Los archivos se generan dentro de la carpeta `logs/`.

Se utilizan dos tipos de archivos:

- `combined-YYYY-MM-DD.log`: contiene los registros correspondientes al nivel mínimo configurado para el entorno.
- `error-YYYY-MM-DD.log`: contiene exclusivamente los niveles `error` y `fatal`.

La rotación se realiza diariamente mediante `winston-daily-rotate-file`, conservando los archivos durante 14 días. Los archivos antiguos se comprimen automáticamente.

La carpeta `logs/` y los archivos `*.log` están incluidos en `.gitignore`, por lo que no se versionan ni se suben al repositorio.

### Endpoint de prueba

Se incorpora un endpoint para comprobar los seis niveles de Winston:

```http
GET /api/logger/test
```

URL local:

```http
GET http://localhost:8080/api/logger/test
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "Prueba de los seis niveles de Winston ejecutada correctamente",
  "levels": ["debug", "http", "info", "warning", "error", "fatal"]
}
```

El endpoint genera un registro de cada nivel para verificar su comportamiento en consola y archivos.

**Importante:** este endpoint está habilitado únicamente fuera del entorno de producción y se utiliza exclusivamente para pruebas.

### Ejemplo práctico de utilización de niveles

En una operación como una transferencia de fondos:

- `debug`: registrar información técnica para seguir el proceso de transferencia.
- `warning`: advertir que una operación fue rechazada por fondos insuficientes.
- `info`: registrar que una transferencia se completó correctamente.
- `error`: registrar un fallo inesperado durante la operación, incluyendo el stack trace cuando corresponda.
- `fatal`: registrar una falla crítica que impida continuar con el funcionamiento del sistema.

---

## Documentación de la API con Swagger

El proyecto incorpora Swagger para documentar los endpoints de la API mediante la especificación OpenAPI 3.0. La documentación permite consultar los recursos disponibles, sus métodos HTTP, parámetros, cuerpos de solicitud y respuestas posibles.

### Acceder a Swagger UI

Con el servidor ejecutándose localmente, ingresar a:

```http
http://localhost:8080/api/docs
```

Desde Swagger UI se pueden explorar los endpoints documentados y ejecutar solicitudes contra el servidor local.

### Configuración

La documentación se configura de manera independiente en los siguientes archivos:

- `src/docs/swagger.config.js`: contiene la configuración de Swagger, la información general de la API, la versión OpenAPI y el servidor local.
- `src/docs/schemas.yaml`: define los esquemas reutilizables de datos y respuestas.
- `src/docs/users.js`, `src/docs/products.js`, `src/docs/stores.js`, `src/docs/orders.js` y `src/docs/mocks.js`: contienen la documentación de los endpoints correspondientes.
- `src/docs/logger.js`: documenta el endpoint de prueba del sistema de logging.

La integración utiliza las dependencias `swagger-jsdoc` y `swagger-ui-express`. La interfaz se monta desde `src/app.js` en la ruta `/api/docs`.

### Recursos documentados

La documentación incluye los endpoints de:

- Users.
- Products.
- Stores.
- Orders.
- Mocks de usuarios, repartidores, pedidos y entregas.
- Carga de datos de prueba mediante seed.
- Prueba del sistema de logging.

Se documentan los métodos HTTP, parámetros de ruta y consulta, cuerpos de solicitud cuando corresponden, respuestas exitosas y errores posibles.

### Esquemas reutilizables

Se definen esquemas para representar las estructuras principales de la API:

- `User` y `UserInput`.
- `Order` y `OrderItem`.
- `Delivery`.
- `Store`.
- `ErrorResponse`.
- `SuccessResponse`.

Esto permite reutilizar las definiciones en distintos endpoints y mantener una documentación consistente.

### Pruebas de la documentación

Se verificó el acceso a Swagger UI y se probaron endpoints documentados mediante las solicitudes correspondientes:

- `GET /api/users`: respuesta HTTP 200.
- `GET /api/mocks/users?qty=3`: respuesta HTTP 200 y generación de tres usuarios ficticios sin exponer contraseñas.
- `GET /api/logger/test`: respuesta HTTP 200 y ejecución de los seis niveles de Winston.

El endpoint `/api/logger/test` está disponible únicamente fuera del entorno de producción y se utiliza como herramienta de validación del sistema de logging.

**Importante:** la documentación incluye los endpoints de generación de entregas ficticias (`/api/mocks/deliveries`), pero el proyecto no cuenta con una ruta CRUD independiente `/api/deliveries`.

---

## Estado actual del proyecto

Esta versión incluye los requerimientos correspondientes a las **Pre-entregas de los Módulos 1, 2, 3, 4 y 5**.

### Módulo 1

- Configuración de entorno validada.
- Variables de entorno centralizadas.
- Constantes de roles, estados y prioridades.
- Arquitectura Controller-Service-Repository.
- Refactorización de Users y Products.
- Refactorización de Stores y Orders.
- Rutas simplificadas.
- Documentación de instalación y funcionamiento.

### Módulo 2

- Incorporación de la librería `@faker-js/faker`.
- Generación de usuarios y repartidores ficticios.
- Generación de pedidos y entregas ficticias.
- Incorporación del modelo Delivery.
- Relaciones entre usuarios, comercios, pedidos, entregas y repartidores.
- Endpoints GET para generar datos sin persistirlos.
- Endpoint POST para insertar datos de prueba en MongoDB.
- Separación de responsabilidades mediante arquitectura por capas.
- Validación de cantidades generadas.
- Documentación de los endpoints de mocking y seed.

### Módulo 3

- Implementación de la clase personalizada `AppError`.
- Creación de un diccionario centralizado de errores.
- Incorporación de códigos internos y estados HTTP asociados.
- Middleware global para el manejo de errores.
- Normalización del formato de respuestas de error.
- Manejo de errores de validación de Mongoose.
- Manejo de identificadores inválidos y registros duplicados.
- Manejo controlado de errores de MongoDB.
- Integración del manejo centralizado de errores en el módulo de mocks.
- Validación de cantidades recibidas en los endpoints de mocking.
- Derivación de rutas inexistentes al middleware global.
- Pruebas de casos exitosos y errores mediante Thunder Client.

### Módulo 4

- Incorporación de Winston para el registro de eventos.
- Configuración centralizada del logger.
- Definición de seis niveles personalizados: `debug`, `http`, `info`, `warning`, `error` y `fatal`.
- Configuración de niveles según el entorno de ejecución.
- Integración con el middleware global de errores.
- Registro de solicitudes HTTP y duración de las respuestas.
- Registro de eventos importantes de pedidos, mocks y conexión a MongoDB.
- Persistencia de logs en archivos.
- Rotación diaria y retención de 14 días.
- Separación de registros generales y errores críticos.
- Exclusión de archivos de logs mediante `.gitignore`.
- Incorporación de un endpoint de prueba para verificar los niveles de logging.

### Módulo 5

- Incorporación de Swagger para documentar la API mediante OpenAPI 3.0.
- Configuración independiente de Swagger en `src/docs/swagger.config.js`.
- Integración de Swagger UI en la ruta `/api/docs`.
- Documentación de los endpoints de Users, Products, Stores, Orders, Mocks y Logger.
- Documentación de métodos HTTP, parámetros, cuerpos de solicitud y respuestas.
- Definición de esquemas reutilizables para usuarios, pedidos, entregas, comercios y respuestas.
- Documentación de los endpoints de generación de datos ficticios y carga mediante seed.
- Documentación del endpoint de prueba del sistema de logging.
- Verificación de Swagger UI y pruebas de endpoints documentados mediante Thunder Client.

### Pendiente para próximos módulos

- Tests automatizados.
- Multer.
- Docker.
