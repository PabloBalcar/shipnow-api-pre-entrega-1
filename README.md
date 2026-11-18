# ShipNow API

API REST de logística y envíos construida con **Node.js, Express y MongoDB (Mongoose)**, organizada mediante una arquitectura por capas (**Router → Controller → Service → Repository**).

El proyecto incorpora manejo centralizado de errores, logging con Winston, documentación mediante Swagger (OpenAPI 3.0), testing automatizado, carga y validación de archivos, configuración para distintos entornos y despliegue mediante Docker y Docker Compose.

---

## Cómo correr el proyecto localmente

### 1. Instalar dependencias

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

### 2. Iniciar MongoDB

Antes de iniciar la API, es necesario contar con una instancia de MongoDB en funcionamiento.

Puede utilizarse una instalación local de MongoDB o una instancia de MongoDB Atlas.

Si se utiliza una instancia local, verificar que el servicio esté iniciado y disponible en el puerto `27017`.

### 3. Configurar las variables de entorno

Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Configurar las variables necesarias:

```env
PORT=8080
NODE_ENV=development
LOG_LEVEL=debug
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow

### Variables opcionales
MONGODB_DNS_SERVER=
CORS_ORIGINS=
```

Las variables `PORT`, `NODE_ENV` y `MONGODB_URI` son obligatorias.

`LOG_LEVEL` es opcional y permite configurar el nivel mínimo de logging.

Valores permitidos:

- `fatal`
- `error`
- `warning`
- `info`
- `http`
- `debug`

Si no se especifica, se utiliza `debug` en desarrollo y testing, e `info` en producción.

`NODE_ENV` acepta los siguientes valores:

- `development`
- `test`
- `production`

`MONGODB_DNS_SERVER` es opcional y permite configurar un servidor DNS específico para la resolución de direcciones de MongoDB.

`CORS_ORIGINS` es opcional y permite definir los orígenes autorizados para las solicitudes CORS. Cuando se configura, los orígenes se especifican separados por comas. En producción deben definirse los orígenes que estarán autorizados.

Si falta alguna variable obligatoria o su valor es inválido, la aplicación no inicia y muestra un error descriptivo.

### 4. Levantar el servidor

Ejecutar:

```bash
npm start
```

El servidor inicia utilizando el puerto configurado en `PORT`. En el archivo `.env.example` se proporciona `8080` como valor de configuración recomendado.

### 5. Verificar el funcionamiento

Realizar una petición al endpoint de health check:

```http
GET http://localhost:8080/health
```

También está disponible:

```http
GET http://localhost:8080/api/health
```

Respuesta esperada:

```json
{
  "status": "success",
  "environment": "development",
  "database": "connected",
  "uptime": 20,
  "timestamp": "2026-11-18T01:41:36.335Z"
}
```

El endpoint informa el estado de la aplicación, el entorno de ejecución, el estado de la conexión con MongoDB, el tiempo de actividad y la fecha de la consulta.

Devuelve HTTP `200` cuando la base de datos está conectada y HTTP `503` cuando no está disponible.

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
│   ├── error.middleware.js
│   ├── upload.middleware.js
│   ├── file-signature.middleware.js
│   └── ...
├── models/
│   ├── delivery.model.js
│   └── ...
├── repositories/
│   ├── mocks.repository.js
│   ├── deliveries.repository.js
│   └── ...
├── routes/
│   ├── mocks.router.js
│   ├── deliveries.router.js
│   └── ...
├── services/
│   ├── mocks.service.js
│   ├── deliveries.service.js
│   └── ...
├── utils/
│   ├── app-error.js
│   ├── mock-generator.js
│   └── ...
├── docs/
│   ├── swagger.config.js
│   ├── schemas.yaml
│   └── ...
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

Centraliza el tratamiento de errores y permite procesar aspectos transversales de las solicitudes, como la carga y validación de archivos.

### ¿Por qué separar Service y Repository?

El Repository se ocupa de **cómo se accede a los datos**, mientras que el Service define **qué reglas de negocio se deben aplicar**.

Esta separación permite modificar la forma de almacenar los datos sin alterar las reglas del negocio, y cambiar las reglas sin modificar las consultas a la base de datos.

---

## Configuración y constantes

Las variables de entorno se centralizan en `src/config/env.config.js`.

La aplicación valida:

- Que existan `PORT`, `MONGODB_URI` y `NODE_ENV`.
- Que `PORT` sea un número entero dentro del rango permitido.
- Que `NODE_ENV` tenga un valor permitido.
- Que `LOG_LEVEL`, cuando se especifica, corresponda a uno de los niveles admitidos.

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

El registro público de usuarios asigna automáticamente el rol `USER`. El rol no se recibe como un campo modificable desde la operación de creación.

### Estados de pedidos

```text
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Prioridades de pedidos

```text
low
normal
high
```

### Estados de entregas

```text
pending
assigned
picked_up
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

Un usuario representa a un cliente, un comercio es el lugar desde donde sale el pedido, y un pedido es una solicitud asociada a un usuario y a un comercio.

Las entregas se relacionan con los pedidos y pueden tener asignado un repartidor con rol `COURIER`.

### Flujo principal

1. Crear un usuario.
2. Crear un comercio.
3. Crear un producto asociado al comercio.
4. Crear un pedido utilizando el ID del usuario y del comercio.
5. Crear una entrega asociada al pedido.
6. Asignar un repartidor.
7. Actualizar los estados de la entrega y del pedido.

---

## Users

Representa a los usuarios del sistema.

### Campos principales

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "Password123"
}
```

Roles disponibles: `ADMIN`, `USER` y `COURIER`.

El rol predeterminado para los usuarios creados mediante el registro es `USER`.

La contraseña se almacena utilizando un mecanismo de hash y no se devuelve en las respuestas de la API.

### Endpoints

```http
GET    /api/users
GET    /api/users/:uid
POST   /api/users
PUT    /api/users/:uid
DELETE /api/users/:uid
```

### Cargar documentos de usuario

```http
POST /api/users/:uid/documents
```

La solicitud utiliza `multipart/form-data` y admite los siguientes campos:

- `document`: archivo que se desea cargar.
- `type`: tipo de documento.

Tipos de documentos permitidos:

```text
user_document
driver_license
administrative_document
```

Los archivos admitidos son PDF, JPEG, PNG y WebP, con un tamaño máximo de 5 MB.

---

## Products

Cada producto pertenece a un comercio y tiene un stock y un estado.

Los estados disponibles son `available` y `out_of_stock`, determinados automáticamente según el stock.

### Endpoints

```http
GET    /api/products
GET    /api/products/:pid
POST   /api/products
PUT    /api/products/:pid
DELETE /api/products/:pid
```

El listado admite los siguientes parámetros de consulta:

```http
GET /api/products?page=1&limit=10
GET /api/products?includeOutOfStock=true
GET /api/products?store=ID_DEL_COMERCIO
```

Por defecto, muestra solamente productos con stock disponible. El parámetro `includeOutOfStock=true` permite incluir los productos sin stock.

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

El estado se calcula automáticamente:

- Si el stock es mayor que cero, el producto queda como `available`.
- Si el stock es cero, el producto queda como `out_of_stock`.

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

El listado admite paginación mediante `page` y `limit`.

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

Para actualizar un comercio se admiten los campos `name` y `address`. El propietario y el estado del comercio no forman parte de los campos modificables mediante esta operación.

---

## Orders

Representa los pedidos o envíos realizados por los usuarios.

### Endpoints

```http
GET    /api/orders
GET    /api/orders/:oid
POST   /api/orders
POST   /api/orders/:oid/proof
PUT    /api/orders/:oid/status
DELETE /api/orders/:oid
```

El listado admite paginación.

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

Los estados permitidos son:

```text
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Cargar comprobante

```http
POST /api/orders/:oid/proof
```

La solicitud utiliza `multipart/form-data` con el campo `proof`.

Se admiten archivos PDF, JPEG, PNG y WebP de hasta 5 MB.

Los metadatos del archivo se almacenan asociados al pedido.

---

## Deliveries

Representa las entregas asociadas a los pedidos.

Cada entrega tiene una referencia a un pedido y puede tener asignado un repartidor (`courier`) con rol `COURIER`.

El módulo cuenta con Repository, Service, Controller y Router propios, y permite gestionar las entregas, cargar comprobantes y consultar su seguimiento.

### Endpoints

```http
GET  /api/deliveries
GET  /api/deliveries/:did
POST /api/deliveries
GET  /api/deliveries/:did/tracking
PUT  /api/deliveries/:did/assign
PUT  /api/deliveries/:did/status
POST /api/deliveries/:did/proof
```

### Campos principales

- `order`: referencia al pedido asociado.
- `courier`: referencia al repartidor asignado. Puede ser `null`.
- `status`: estado actual de la entrega.
- `deliveredAt`: fecha de entrega, cuando corresponde.
- `proof`: metadatos del comprobante de entrega, cuando existe.
- `history`: historial de cambios de estado, con fecha y nota opcional.

### Estados disponibles

```text
pending
assigned
picked_up
in_transit
delivered
cancelled
```

### Crear una entrega

```http
POST /api/deliveries
```

La entrega se crea asociada a un pedido que se encuentre en estado `created`.

El estado inicial de la entrega es `pending`.

### Asignar repartidor

```http
PUT /api/deliveries/:did/assign
```

La asignación requiere un usuario con rol `COURIER` y una entrega que se encuentre en estado `pending`.

### Actualizar estado

```http
PUT /api/deliveries/:did/status
```

Body de ejemplo:

```json
{
  "status": "picked_up",
  "note": "El repartidor retiró el pedido"
}
```

Las transiciones permitidas incluyen:

```text
assigned → picked_up
picked_up → in_transit
in_transit → delivered
```

También se contempla la cancelación de entregas cuando corresponde.

Los cambios de estado se registran en el historial y se sincronizan con el estado del pedido asociado.

### Consultar seguimiento

```http
GET /api/deliveries/:did/tracking
```

Permite consultar el estado actual, la fecha de entrega, los datos relacionados y el historial de seguimiento.

### Cargar comprobante de entrega

```http
POST /api/deliveries/:did/proof
```

La solicitud utiliza `multipart/form-data` con el campo `proof`.

Se admiten archivos PDF, JPEG, PNG y WebP de hasta 5 MB.

El archivo se valida antes de procesarse y sus metadatos se almacenan asociados a la entrega.

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

Los siguientes endpoints permiten obtener datos simulados sin insertarlos en MongoDB:

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

**Importante:** cada ejecución del seed genera nuevos registros. No elimina los datos existentes. Las inserciones se realizan secuencialmente y no utilizan transacciones; si una operación intermedia falla, las inserciones anteriores podrían permanecer guardadas.

Los endpoints de mocking y seed se habilitan únicamente fuera del entorno de producción.

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

Los errores de negocio se detectan principalmente en los Services. Los Controllers derivan las excepciones mediante `next(error)`, sin construir respuestas de error por separado.

### Formato de respuesta

Las respuestas de error siguen esta estructura:

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

| Código interno            | HTTP | Descripción                                  |
| ------------------------- | ---: | -------------------------------------------- |
| `USER_NOT_FOUND`          |  404 | Usuario no encontrado                        |
| `STORE_NOT_FOUND`         |  404 | Comercio no encontrado                       |
| `PRODUCT_NOT_FOUND`       |  404 | Producto no encontrado                       |
| `ORDER_NOT_FOUND`         |  404 | Pedido no encontrado                         |
| `DELIVERY_NOT_FOUND`      |  404 | Entrega no encontrada                        |
| `INVALID_MOCK_AMOUNT`     |  400 | Cantidad de mocks inválida                   |
| `INVALID_ORDER_STATUS`    |  400 | Estado de pedido inválido                    |
| `INVALID_DELIVERY_STATUS` |  400 | Estado de entrega inválido                   |
| `INVALID_PRODUCT_STOCK`   |  400 | Stock de producto inválido                   |
| `INVALID_ID`              |  400 | Identificador con formato incorrecto         |
| `VALIDATION_ERROR`        |  400 | Error de validación                          |
| `DUPLICATE_RESOURCE`      |  409 | Registro duplicado                           |
| `DATABASE_ERROR`          |  500 | Error de interacción con MongoDB             |
| `MOCK_GENERATION_ERROR`   |  500 | Error durante la generación o carga de mocks |
| `ROUTE_NOT_FOUND`         |  404 | Ruta inexistente                             |
| `INTERNAL_SERVER_ERROR`   |  500 | Error interno no identificado                |

### Errores de Mongoose

El middleware también contempla errores generados por Mongoose y MongoDB:

- `ValidationError`: errores de validación de documentos.
- `CastError`: identificadores o valores con formato incorrecto.
- Código `11000`: conflictos por valores duplicados.
- Errores de conexión o comunicación con MongoDB/Mongoose.
- Errores de carga de archivos generados por Multer.

En los errores de validación se pueden incluir detalles sobre los campos que no cumplen las reglas establecidas.

En producción, los errores internos con estado HTTP 500 se reemplazan por un mensaje genérico para evitar exponer información técnica.

---

## Sistema de logging y monitoreo

El proyecto incorpora **Winston** para registrar eventos importantes, solicitudes HTTP y errores durante la ejecución de la API.

La configuración se centraliza en `src/config/logger.js`, permitiendo utilizar el mismo logger desde los distintos componentes de la aplicación.

### Dependencias utilizadas

- `winston`: gestión de niveles, registro de eventos y almacenamiento en archivos.

### Niveles personalizados

Se definen seis niveles de logging:

| Nivel     | Descripción                                                        |
| --------- | ------------------------------------------------------------------ |
| `debug`   | Información detallada para depuración.                             |
| `http`    | Registro de solicitudes HTTP.                                      |
| `info`    | Eventos importantes del funcionamiento normal.                     |
| `warning` | Situaciones anormales o advertencias.                              |
| `error`   | Errores inesperados de la aplicación.                              |
| `fatal`   | Fallas críticas que pueden impedir el funcionamiento del servidor. |

### Comportamiento según el entorno

El nivel mínimo de registro depende de la configuración del entorno:

- **Development:** utiliza `debug` por defecto.
- **Test:** utiliza `debug` por defecto.
- **Production:** utiliza `info` por defecto.

Los registros se almacenan en archivos. La salida a consola está habilitada únicamente en desarrollo.

### Configuración mediante LOG_LEVEL

El nivel mínimo de logging también puede configurarse mediante la variable de entorno `LOG_LEVEL`.

Los valores permitidos son:

- `fatal`
- `error`
- `warning`
- `info`
- `http`
- `debug`

Esto permite ajustar la cantidad de información registrada sin modificar el código de la aplicación.

### Eventos registrados

El logger está integrado en distintos componentes:

- `server.js`: registra el inicio del servidor y los errores críticos de inicialización.
- `config/db.js`: registra la conexión exitosa o fallida con MongoDB.
- `app.js`: registra solicitudes HTTP, incluyendo método, ruta, código de estado y duración.
- `middlewares/error.middleware.js`: registra errores controlados y errores inesperados.
- `services/mocks.service.js`: registra la generación y carga de datos ficticios.
- `services/orders.service.js`: registra operaciones importantes relacionadas con pedidos.

Los registros evitan incluir contraseñas, credenciales y otros datos sensibles.

### Almacenamiento y rotación de archivos

Los archivos se generan dentro de la carpeta `logs/`.

Se utilizan dos tipos de archivos:

- `combined.log`: contiene los registros generales, incluyendo solicitudes HTTP.
- `error.log`: contiene exclusivamente los niveles `error` y `fatal`.

Los archivos tienen rotación automática por tamaño: al alcanzar 5 MB se generan archivos de respaldo, conservando hasta cinco archivos por transporte.

La carpeta `logs/` y los archivos `*.log` están incluidos en `.gitignore`, por lo que no se versionan ni se suben al repositorio.

### Endpoint de prueba

Se incorpora un endpoint para comprobar los seis niveles de Winston:

```http
GET /api/logger/test
```

URL local:

```text
http://localhost:8080/api/logger/test
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "Prueba de los seis niveles de Winston ejecutada correctamente",
  "levels": ["debug", "http", "info", "warning", "error", "fatal"]
}
```

El endpoint genera un registro de cada nivel para verificar su comportamiento.

**Importante:** este endpoint está habilitado únicamente fuera del entorno de producción.

---

## Documentación de la API con Swagger

El proyecto incorpora Swagger para documentar la API mediante la especificación OpenAPI 3.0.

### Acceder a Swagger UI

Con el servidor ejecutándose localmente, ingresar a:

```text
http://localhost:8080/api/docs
```

Desde Swagger UI se pueden explorar los endpoints documentados y ejecutar solicitudes contra el servidor.

La especificación OpenAPI en formato JSON también está disponible en:

```text
http://localhost:8080/api/docs.json
```

### Configuración

La documentación se configura de manera independiente en los siguientes archivos:

- `src/docs/swagger.config.js`: contiene la configuración de Swagger, la información general de la API, la versión OpenAPI y la configuración del servidor.
- `src/docs/schemas.yaml`: define los esquemas reutilizables de datos y respuestas.
- `src/docs/users.js`: documentación de usuarios.
- `src/docs/products.js`: documentación de productos.
- `src/docs/stores.js`: documentación de comercios.
- `src/docs/orders.js`: documentación de pedidos.
- `src/docs/deliveries.js`: documentación de entregas.
- `src/docs/mocks.js`: documentación de mocking y seed.
- `src/docs/logger.js`: documentación del endpoint de prueba del sistema de logging.
- `src/docs/health.js`: documentación de los endpoints de health check.

La integración utiliza `swagger-jsdoc` y `swagger-ui-express`. La interfaz se monta desde `src/app.js` en la ruta `/api/docs`.

### Recursos documentados

La documentación incluye:

- Users.
- Products.
- Stores.
- Orders.
- Deliveries.
- Mocks de usuarios, repartidores, pedidos y entregas.
- Carga de datos de prueba mediante seed.
- Prueba del sistema de logging.
- Health check de la aplicación.

Se documentan los métodos HTTP, parámetros de ruta y consulta, cuerpos de solicitud, esquemas reutilizables y respuestas posibles.

---

## Testing automatizado

El proyecto incorpora pruebas automatizadas utilizando **Mocha, Chai y Supertest**.

Estas herramientas permiten ejecutar solicitudes HTTP contra la aplicación, comprobar los códigos de respuesta y validar la estructura y el contenido de las respuestas sin necesidad de iniciar manualmente el servidor.

### Dependencias utilizadas

- `mocha`: ejecutor de pruebas.
- `chai`: biblioteca de aserciones.
- `supertest`: permite realizar solicitudes HTTP contra la aplicación.

### Configuración del entorno de testing

Las pruebas utilizan una base de datos independiente llamada `shipnow-test`, separada de la base de desarrollo.

Para ejecutar los tests se debe crear un archivo `.env.test` en la raíz del proyecto con las siguientes variables:

```env
PORT=8081
NODE_ENV=test
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow-test
```

La URI debe apuntar exclusivamente a la base de datos de testing. Si se utiliza MongoDB Atlas, se debe configurar la conexión correspondiente y seleccionar la base `shipnow-test`.

El archivo `.env.test` no se versiona y está excluido mediante `.gitignore`.

Antes de establecer la conexión, `tests/setup.js` verifica que `NODE_ENV` sea `test` y que la URI corresponda a `shipnow-test`. Si alguna condición no se cumple, las pruebas no se ejecutan.

### Ejecutar las pruebas

Ejecutar la suite completa:

```bash
npm test
```

El comando utiliza Mocha y carga previamente `tests/setup.js`, que configura el entorno, establece la conexión con MongoDB y la cierra al finalizar las pruebas.

### Módulos y casos cubiertos

**Aplicación**

- Respuesta HTTP 404 para rutas inexistentes.
- Validación de la estructura de error.
- Verificación de endpoints de health check.

**Usuarios**

- Listado de usuarios.
- Respuesta 404 cuando un usuario no existe.
- Paginación.
- Creación de usuarios.
- Asignación automática del rol `USER`.
- Hash de contraseñas.
- Rechazo de campos no permitidos.
- Actualización de usuarios.
- Carga de documentos.

**Comercios**

- Listado de comercios.
- Paginación.
- Creación y actualización.
- Validación de campos permitidos.

**Productos**

- Listado de productos.
- Paginación.
- Filtrado por disponibilidad.
- Filtrado por comercio.
- Creación y actualización.
- Validación de stock.
- Cálculo automático del estado según el stock.

**Pedidos**

- Listado de pedidos.
- Paginación.
- Creación y cálculo automático del total.
- Validación de datos obligatorios.
- Consulta de pedidos por ID.
- Respuesta 404 para pedidos inexistentes.
- Actualización de estados.
- Rechazo de estados inválidos.
- Carga de comprobantes.

**Entregas**

- Creación de entregas.
- Validación de pedidos asociados.
- Asignación de repartidores.
- Validación de roles.
- Transiciones de estados.
- Sincronización con pedidos.
- Consulta de seguimiento.
- Validación de operaciones no permitidas.
- Carga y validación de comprobantes de entrega.

**Mocks**

- Generación de usuarios y repartidores.
- Generación de pedidos y entregas.
- Validación de cantidades solicitadas.
- Inserción de datos relacionados mediante seed.
- Validación de errores en la carga de datos.

**Logger**

- Verificación de los seis niveles de Winston: `debug`, `http`, `info`, `warning`, `error` y `fatal`.

**Swagger**

- Verificación de disponibilidad de la documentación de la API.

### Datos de prueba y limpieza

Los tests crean los registros necesarios para probar las operaciones que dependen de MongoDB.

Los datos generados por las pruebas se limpian al finalizar las suites correspondientes, preservando los documentos que ya existían.

La base `shipnow-test` debe mantenerse separada de la base utilizada durante el desarrollo.

### Resultado de las pruebas

La última ejecución confirmada de la suite automatizada finalizó correctamente:

```text
94 passing
```

Los 94 casos de prueba finalizaron satisfactoriamente, sin pruebas fallidas.

---

## Carga de archivos con Multer

El proyecto incorpora **Multer** para gestionar la recepción y el almacenamiento de archivos enviados mediante solicitudes HTTP.

### Características principales

- Límite de tamaño de archivo de 5 MB.
- Validación de tipos MIME permitidos.
- Validación de la firma del contenido de los archivos.
- Almacenamiento de archivos dentro de la carpeta `uploads/`.
- Separación de directorios para documentos y comprobantes.
- Nombres de archivo únicos.
- Almacenamiento de metadatos asociados a los recursos.
- Manejo de errores durante la carga.

Los directorios utilizados incluyen:

```text
uploads/
├── documents/
└── proofs/
```

Los archivos admitidos son PDF, JPEG, PNG y WebP.

Los metadatos almacenados incluyen:

- Nombre original.
- Nombre del archivo almacenado.
- Ruta.
- Tipo MIME.
- Tamaño.
- Tipo de documento, cuando corresponde.
- Fecha de carga.

La carpeta `uploads/` está excluida de Git mediante `.gitignore`, por lo que los archivos recibidos no se incorporan al repositorio.

En Docker se utiliza un volumen persistente para conservar los archivos subidos aunque se elimine o se reemplace el contenedor.

---

## Producción y Docker

El proyecto incorpora configuraciones para ejecutar la API en distintos entornos y facilitar su despliegue mediante Docker y Docker Compose.

### Configuración de producción

La aplicación utiliza variables de entorno para adaptar su comportamiento según el entorno de ejecución.

| Variable             | Descripción                                  |
| -------------------- | -------------------------------------------- |
| `PORT`               | Puerto en el que escucha el servidor.        |
| `MONGODB_URI`        | URI de conexión a MongoDB.                   |
| `NODE_ENV`           | Entorno de ejecución.                        |
| `LOG_LEVEL`          | Nivel mínimo de logging.                     |
| `MONGODB_DNS_SERVER` | Servidor DNS opcional para resolver MongoDB. |
| `CORS_ORIGINS`       | Orígenes permitidos para solicitudes CORS.   |

Las variables obligatorias se validan al iniciar la aplicación.

En producción se utiliza `info` como nivel de logging predeterminado. Los endpoints de prueba del logger y los endpoints de mocking no están disponibles en este entorno.

Para producción se recomienda configurar `CORS_ORIGINS` con los dominios autorizados para acceder a la API.

### Health check

La API dispone de los siguientes endpoints:

```http
GET /health
GET /api/health
```

Informan el estado de la aplicación y de la conexión con MongoDB.

Devuelven HTTP `200` cuando la base de datos está conectada y HTTP `503` cuando no está disponible.

Docker Compose también configura un health check para MongoDB y establece que la API espere a que la base de datos esté saludable antes de iniciarse.

### Cierre ordenado del servidor

El servidor escucha las señales `SIGINT` y `SIGTERM` para realizar un cierre ordenado.

Durante el apagado:

1. Se deja de aceptar nuevas conexiones HTTP.
2. Se espera el cierre del servidor.
3. Se desconecta MongoDB.
4. Se finaliza el proceso.

Esto permite evitar cierres abruptos y facilita la administración del contenedor.

### Dockerfile

El proyecto incluye:

- `Dockerfile`: define la construcción de la imagen de la API.
- `.dockerignore`: excluye archivos innecesarios o sensibles del contexto de construcción.

La imagen utiliza Node.js 24 sobre Debian Bookworm Slim, instala únicamente las dependencias de producción y ejecuta la aplicación con un usuario sin privilegios de root.

### Construir la imagen

Desde la raíz del proyecto:

```bash
docker build -t shipnow-api .
```

### Docker Compose

El proyecto incluye `docker-compose.yml` para levantar la API y MongoDB como servicios independientes.

La configuración contempla:

- Servicio de MongoDB.
- Servicio de la API.
- Red interna entre contenedores.
- Health check de MongoDB.
- Espera de disponibilidad de la base de datos antes de iniciar la API.
- Volúmenes persistentes para datos, archivos subidos y logs.
- Reinicio automático de los servicios.

Para construir las imágenes y levantar los servicios:

```bash
docker compose up --build -d
```

Consultar el estado de los contenedores:

```bash
docker compose ps
```

Consultar los registros de la API:

```bash
docker compose logs -f api
```

Consultar los registros de MongoDB:

```bash
docker compose logs -f mongodb
```

Verificar el funcionamiento de la API:

```bash
curl http://localhost:8080/health
```

La API queda disponible en:

```text
http://localhost:8080
```

Swagger UI queda disponible en:

```text
http://localhost:8080/api/docs
```

La especificación OpenAPI JSON queda disponible en:

```text
http://localhost:8080/api/docs.json
```

### Detener los servicios

```bash
docker compose down
```

Este comando detiene y elimina los contenedores, pero conserva los volúmenes persistentes.

**Importante:** no utilizar `docker compose down -v` si se desea conservar los datos de MongoDB, archivos subidos y logs.

### Volúmenes persistentes

Docker Compose utiliza volúmenes independientes para:

- `mongodb_data`: datos de MongoDB.
- `shipnow_uploads`: archivos subidos.
- `shipnow_logs`: archivos de logging.

Esto permite conservar la información aunque se reemplacen los contenedores.

### Archivos excluidos de Docker y Git

Se excluyen archivos y directorios que no deben formar parte de la imagen o del repositorio:

- `node_modules/`
- `.env`
- `.env.test`
- `.git/`
- `logs/`
- `uploads/`
- `coverage/`
- Archivos de log y temporales.

Las variables sensibles se proporcionan durante la ejecución y no se incorporan a la imagen.

---

## Estado actual del proyecto

Esta versión incluye los requerimientos correspondientes a las **Pre-entregas de los Módulos 1 al 8**.

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
- Integración del manejo centralizado de errores en los módulos.
- Validación de cantidades recibidas en los endpoints de mocking.
- Derivación de rutas inexistentes al middleware global.
- Pruebas de casos exitosos y errores.

### Módulo 4

- Incorporación de Winston para el registro de eventos.
- Configuración centralizada del logger.
- Definición de seis niveles personalizados: `debug`, `http`, `info`, `warning`, `error` y `fatal`.
- Configuración de niveles según el entorno de ejecución.
- Integración con el middleware global de errores.
- Registro de solicitudes HTTP y duración de las respuestas.
- Registro de eventos importantes de pedidos, mocks y conexión a MongoDB.
- Persistencia de logs en archivos.
- Rotación automática por tamaño (5 MB), con hasta cinco archivos por transporte.
- Separación de registros generales y errores críticos.
- Exclusión de archivos de logs mediante `.gitignore`.
- Incorporación de un endpoint de prueba para verificar los niveles de logging.

### Módulo 5

- Incorporación de Swagger para documentar la API mediante OpenAPI 3.0.
- Configuración independiente de Swagger en `src/docs/swagger.config.js`.
- Integración de Swagger UI en la ruta `/api/docs`.
- Exposición de la especificación OpenAPI JSON en `/api/docs.json`.
- Documentación de los endpoints de Users, Products, Stores, Orders, Deliveries, Mocks, Logger y Health.
- Documentación de métodos HTTP, parámetros, cuerpos de solicitud y respuestas.
- Definición de esquemas reutilizables para usuarios, pedidos, entregas, comercios y respuestas.
- Documentación de los endpoints de generación de datos ficticios y carga mediante seed.
- Verificación de Swagger UI y pruebas de endpoints documentados.

### Módulo 6

- Incorporación de pruebas automatizadas utilizando Mocha, Chai y Supertest.
- Configuración de un entorno de testing independiente.
- Separación de la base de datos de pruebas respecto de desarrollo.
- Configuración de la conexión y limpieza de datos de prueba.
- Pruebas de aplicación, usuarios, comercios, productos, pedidos, entregas, mocks, logger y documentación.
- Verificación de respuestas HTTP, validaciones y errores.
- Suite de pruebas con **94 casos aprobados** en la última ejecución confirmada.

### Módulo 7

- Incorporación de Multer para la recepción de archivos.
- Configuración de límites de tamaño.
- Validación de tipos MIME permitidos.
- Validación de la firma del contenido de los archivos.
- Organización del almacenamiento de documentos y comprobantes.
- Integración de la carga de archivos con usuarios, pedidos y entregas.
- Almacenamiento de metadatos en MongoDB.
- Exclusión de archivos subidos mediante `.gitignore`.
- Pruebas de funcionalidades relacionadas con la carga de archivos.

### Módulo 8

- Configuración de variables de entorno para desarrollo, testing y producción.
- Validación de variables críticas al iniciar la aplicación.
- Incorporación de `LOG_LEVEL` configurable.
- Configuración opcional de `MONGODB_DNS_SERVER` y `CORS_ORIGINS`.
- Mejora del endpoint `/health`, incluyendo estado de la base de datos, entorno, uptime y timestamp.
- Incorporación de la ruta alternativa `/api/health`.
- Implementación del cierre ordenado del servidor mediante `SIGINT` y `SIGTERM`.
- Incorporación de `Dockerfile`.
- Incorporación de `.dockerignore`.
- Construcción de la imagen `shipnow-api`.
- Configuración de Docker Compose con API y MongoDB.
- Health check de MongoDB y dependencia de disponibilidad entre servicios.
- Persistencia de datos, archivos y logs mediante volúmenes Docker.
- Ejecución de la API con usuario sin privilegios de root.
- Verificación del funcionamiento en entorno `production`.
- Comprobación de conexión con MongoDB desde el contenedor.
- Verificación del health check mediante HTTP 200.

---

## Consideraciones finales

- No subir archivos `.env` ni credenciales al repositorio.
- Mantener separadas las bases de datos de desarrollo y testing.
- No incorporar archivos de `uploads/` ni `logs/` al control de versiones.
- Configurar las variables de entorno necesarias antes de iniciar la aplicación.
- Utilizar los volúmenes Docker para conservar los archivos y registros generados durante la ejecución.
- Mantener los endpoints de prueba fuera del entorno de producción.
- Configurar los orígenes permitidos mediante `CORS_ORIGINS` en producción.
- Revisar los permisos y la exposición de endpoints antes de realizar un despliegue público.
