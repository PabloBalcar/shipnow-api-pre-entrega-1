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

Por ejemplo:

```txt
Error: Faltan variables de entorno obligatorias: MONGODB_URI. Revisá tu archivo .env (podés guiarte con .env.example).
```

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
│   ├── env.config.js        # único lugar que lee process.env y valida variables
│   └── db.js                # conexión a MongoDB
├── constants/
│   └── index.js             # roles, estados y prioridades (Object.freeze)
├── controllers/             # reciben req/res, llaman al service y responden
├── middlewares/
│   └── error.middleware.js  # manejo centralizado de errores
├── models/                  # esquemas de Mongoose
├── repositories/            # acceso a datos mediante Mongoose
├── routes/                  # conectan endpoints con controllers
├── services/                # lógica de negocio
├── utils/
│   └── app-error.js         # errores personalizados con código HTTP
├── app.js
└── server.js
```

### Flujo de una petición

```txt
Request → Router → Controller → Service → Repository → Model / MongoDB
```

Las entidades refactorizadas son **Users, Products, Stores y Orders**.

### Responsabilidades de cada capa

**Controller**

Es la puerta de entrada HTTP. Recibe los datos de la petición, llama al Service correspondiente y devuelve la respuesta con su código de estado.

**Service**

Contiene la lógica de negocio. No depende de Express ni realiza consultas directas a MongoDB.

**Repository**

Se encarga del acceso a los datos mediante los modelos de Mongoose. Encapsula las consultas, filtros, proyecciones y operaciones sobre la base de datos.

### ¿Por qué separar Service y Repository?

El Repository se ocupa de **cómo se accede a los datos**, mientras que el Service define **qué reglas de negocio se deben aplicar**.

En esta implementación, el Repository:

- Evita devolver el campo `password` en las consultas de usuarios.
- Al listar pedidos, obtiene únicamente los campos necesarios del cliente y del comercio.
- Ordena los pedidos del más nuevo al más antiguo.
- Permite consultar productos mediante filtros como `status` y `store`.
- Utiliza `exists()` cuando solamente es necesario comprobar si un documento existe.

El Service contiene reglas como:

- Calcular automáticamente el total de un pedido (`calculateTotal`).
- Definir el estado inicial y la prioridad por defecto.
- Calcular el estado de un producto según su stock.
- Validar que el cliente y el comercio existan antes de crear un pedido.
- Validar los estados permitidos de un pedido.
- Evitar emails duplicados al crear o actualizar usuarios.
- Determinar cuándo un recurso no existe y devolver el error correspondiente.

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

Los roles disponibles son:

```txt
ADMIN
USER
```

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

### Estados de productos

```txt
available
out_of_stock
```

---

## Funcionamiento de la API

ShipNow API trabaja con tres entidades principales: usuarios, comercios y pedidos.

Un usuario representa a un cliente, un comercio es el lugar desde donde sale el pedido y un pedido es una solicitud de envío asociada a un usuario y a un comercio.

### Flujo principal

1. Crear un usuario.
2. Crear un comercio.
3. Crear un pedido utilizando el ID del usuario y el ID del comercio.
4. Consultar los pedidos.
5. Actualizar el estado de un pedido.

El pedido contiene una lista de productos, una dirección de entrega, un total calculado y un estado.

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

Roles disponibles:

```txt
ADMIN
USER
```

El rol predeterminado es `USER`.

### Obtener usuarios

```http
GET /api/users
```

### Obtener usuario por ID

```http
GET /api/users/:uid
```

### Crear usuario

```http
POST /api/users
```

Body de ejemplo:

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "USER"
}
```

### Actualizar usuario

```http
PUT /api/users/:uid
```

### Eliminar usuario

```http
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

### Obtener comercios

```http
GET /api/stores
```

### Obtener comercio por ID

```http
GET /api/stores/:sid
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

### Actualizar comercio

```http
PUT /api/stores/:sid
```

### Eliminar comercio

```http
DELETE /api/stores/:sid
```

---

## Orders

Representa los pedidos o envíos realizados por los usuarios.

### Obtener pedidos

```http
GET /api/orders
```

### Obtener pedido por ID

```http
GET /api/orders/:oid
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

### Eliminar pedido

```http
DELETE /api/orders/:oid
```

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

Esta versión incluye los requerimientos correspondientes a la **Pre-entrega del Módulo 1**:

- Configuración de entorno validada.
- Variables de entorno centralizadas.
- Constantes de roles, estados y prioridades.
- Arquitectura Controller-Service-Repository.
- Refactorización de Users y Products.
- Refactorización adicional de Stores y Orders.
- Rutas simplificadas.
- Manejo centralizado de errores.
- Documentación de instalación y funcionamiento.

### Pendiente para próximos módulos

- Logger profesional.
- Documentación Swagger.
- Tests automatizados.
- Multer.
- Docker.
