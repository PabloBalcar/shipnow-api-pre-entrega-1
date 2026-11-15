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

```txt
src/
├── config/
│   ├── env.config.js
│   └── db.js
├── constants/
│   └── index.js
├── controllers/
│   ├── mocks.controller.js
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

```txt
Request → Router → Controller → Service → Repository → Model / MongoDB
```

Las entidades principales son **Users, Products, Stores, Orders y Deliveries**.

### Responsabilidades de cada capa

**Controller**

Es la puerta de entrada HTTP. Recibe los datos de la petición, llama al Service correspondiente y devuelve la respuesta con su código de estado.

**Service**

Contiene la lógica de negocio. No depende de Express ni realiza consultas directas a MongoDB.

**Repository**

Se encarga del acceso a los datos mediante los modelos de Mongoose. Encapsula las consultas y operaciones sobre la base de datos.

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

### Roles de usuario

```txt
ADMIN
USER
COURIER
```

- `ADMIN`: administrador del sistema.
- `USER`: usuario o cliente.
- `COURIER`: repartidor.

### Estados de pedidos

```txt
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Prioridades de entrega

```txt
low
normal
high
```

### Estados de entregas

```txt
pending
assigned
in_transit
delivered
cancelled
```

### Estados de productos

```txt
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

```txt
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

```txt
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

**Importante:** cada ejecución del seed genera nuevos registros. No elimina los datos existentes.

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

## Formato general de respuestas

Las respuestas exitosas utilizan la siguiente estructura:

```json
{
  "status": "success",
  "payload": {}
}
```

Las respuestas de error utilizan:

```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

El manejo de errores se centraliza mediante un middleware.

Algunos códigos HTTP utilizados:

- `400`: datos inválidos, IDs incorrectos o validaciones fallidas.
- `404`: recurso inexistente.
- `409`: conflicto por email duplicado.
- `500`: error interno del servidor.

---

## Estado actual del proyecto

Esta versión incluye los requerimientos correspondientes a las **Pre-entregas de los Módulos 1 y 2**.

### Módulo 1

- Configuración de entorno validada.
- Variables de entorno centralizadas.
- Constantes de roles, estados y prioridades.
- Arquitectura Controller-Service-Repository.
- Refactorización de Users y Products.
- Refactorización de Stores y Orders.
- Rutas simplificadas.
- Manejo centralizado de errores.
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

### Pendiente para próximos módulos

- Logger profesional.
- Documentación Swagger.
- Tests automatizados.
- Multer.
- Docker.
