# ShipNow API

API REST de logística y envíos construida con Node.js, Express y MongoDB (Mongoose), organizada en **arquitectura por capas** (Router → Controller → Service → Repository).

## Cómo correr el proyecto localmente

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
```

2. Crear el archivo `.env` a partir de `.env.example` y completar los valores:

```bash
cp .env.example .env
```

```bash
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
NODE_ENV=development
```

Las tres variables son **obligatorias**. `NODE_ENV` acepta `development`, `test` o `production`. Si falta alguna, la app no arranca y muestra un error descriptivo, por ejemplo:

```txt
Error: Faltan variables de entorno obligatorias: MONGODB_URI. Revisá tu archivo .env (podés guiarte con .env.example).
```

3. Levantar el servidor:

```bash
npm run dev   # con nodemon
npm start     # sin nodemon
```

4. Verificar que funciona: `GET http://localhost:8080/health`

## Arquitectura

```txt
src/
├── config/
│   ├── env.config.js        # único lugar que lee process.env; valida variables al arrancar
│   └── db.js                # conexión a MongoDB
├── constants/
│   └── index.js             # roles, estados de pedido, prioridades (Object.freeze)
├── controllers/             # req/res: llaman al service y devuelven el status code
├── middlewares/
│   └── error.middleware.js  # traduce errores a { status: "error", message }
├── models/                  # solo esquemas de Mongoose
├── repositories/            # (users, stores, orders, products) único lugar que conoce Mongoose/MongoDB
├── routes/                  # solo conectan path + método con el controller
├── services/                # lógica de negocio
├── utils/
│   └── app-error.js         # error con código HTTP (404, 400, 409...)
├── app.js
└── server.js
```

Flujo de una petición:

```txt
Request → Router → Controller → Service → Repository → Model / MongoDB
```

Entidades refactorizadas: **Users**, **Products**, **Stores** y **Orders**. `Products` se agregó siguiendo la consigna (la base no la traía): cada producto pertenece a un comercio y tiene `stock` y `status`.

## Por qué separé la lógica entre Service y Repository

**Repository: cómo se accede a los datos.** Es el único archivo que importa los modelos de Mongoose. Además de buscar y guardar, encapsula decisiones de acceso:

* Nunca devuelve el campo `password` (proyección `-password`). Antes, `GET /api/users` y los `populate` de pedidos exponían la contraseña.
* Al listar pedidos, trae solo los campos útiles del cliente y del comercio, y ordena del más nuevo al más viejo.
* En productos, acepta filtros (`status`, `store`) y trae el nombre y la dirección del comercio.
* Usa `exists()` cuando solo hace falta saber si algo existe, sin traer el documento completo.

**Service: qué reglas de negocio aplican.** No sabe nada de Express ni de Mongoose. Acá viven:

* El estado de un producto (`available` / `out_of_stock`) se deduce del stock. Por defecto el listado de productos solo muestra los que tienen stock (`?includeOutOfStock=true` muestra todos).
* El cálculo del total del pedido (`calculateTotal`), el estado inicial (`created`) y la prioridad por defecto.
* Validar que el cliente y el comercio existan antes de crear un pedido.
* Validar que el estado nuevo de un pedido sea uno de los permitidos.
* No permitir emails duplicados al crear o actualizar usuarios.
* Decidir qué es un "no encontrado" (404) y lanzar el error correspondiente.

La idea: si mañana cambia la base de datos, se toca solo el Repository; si cambia una regla del negocio (por ejemplo cómo se calcula el total), se toca solo el Service. Y el Service se puede testear sin levantar Express ni MongoDB.

## Cambios de comportamiento respecto a la base

* Las respuestas ya no incluyen la contraseña del usuario.
* Los errores pasan por un middleware único y mantienen el formato `{ "status": "error", "message": "..." }`. IDs inválidos y errores de validación responden `400`; email duplicado `409`; recurso inexistente `404`.
* Estado inválido en `PUT /api/orders/:oid/status` responde `400` con la lista de estados permitidos.

---

## Funcionamiento base de la API

ShipNow API trabaja con tres entidades principales: usuarios, comercios y pedidos. Un usuario representa a un cliente, un comercio es el lugar desde donde sale el pedido, y un pedido es una solicitud de envío asociada a un usuario y a un comercio.

### Flujo principal

El flujo básico de la API es:

1. Crear un usuario.
2. Crear un comercio.
3. Crear un pedido usando el ID del usuario y el ID del comercio.
4. Consultar los pedidos.
5. Actualizar el estado de un pedido.

El pedido contiene una lista de items, una dirección de entrega, un total calculado y un estado.

### Entidades principales

### User

Representa a un usuario dentro del sistema.

Campos principales:

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "customer"
}
```

Roles disponibles (definidos en `USER_ROLES`):

```txt
admin
customer
store
```

En esta versión base, el usuario se usa principalmente como cliente del pedido.

---

### Store

Representa un comercio.

Campos principales:

```json
{
  "name": "Kiosco Centro",
  "address": "Av. Siempre Viva 742",
  "owner": "ID_DEL_USUARIO"
}
```

El campo `owner` guarda el ID de un usuario asociado al comercio.

---

### Order

Representa un pedido o envío.

Campos principales:

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
    }
  ]
}
```

Cuando se crea un pedido, la API calcula el total automáticamente recorriendo los items.

Ejemplo:

```txt
2 unidades x $1500 = $3000
```

El pedido se crea inicialmente con estado:

```txt
created
```

Estados posibles del pedido:

```txt
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Endpoints disponibles

### Health check

Permite verificar que la API está funcionando.

```http
GET /health
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "API funcionando correctamente"
}
```

---

## Users

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
  "role": "customer"
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

Cada producto pertenece a un comercio. Estados (`PRODUCT_STATUS`): `available` y `out_of_stock`, que se calculan solos según el `stock`.

```http
GET    /api/products                          # solo con stock
GET    /api/products?includeOutOfStock=true   # todos
GET    /api/products?store=ID_DEL_COMERCIO
GET    /api/products/:pid
POST   /api/products
PUT    /api/products/:pid
DELETE /api/products/:pid
```

Body de ejemplo para crear:

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

Respuesta esperada:

```json
{
  "status": "success",
  "payload": {
    "_id": "ID_DEL_PEDIDO",
    "customer": "ID_DEL_USUARIO",
    "store": "ID_DEL_COMERCIO",
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
    ],
    "deliveryAddress": "Av. Siempre Viva 742",
    "total": 3800,
    "status": "created"
  }
}
```

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

Las respuestas exitosas siguen una estructura simple:

```json
{
  "status": "success",
  "payload": {}
}
```

Las respuestas de error mantienen esta estructura y se generan desde un middleware centralizado:

```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

## Estado actual del proyecto

Esta versión incluye la **Pre-entrega del Módulo 1**:

```txt
configuración de entorno validada (src/config/env.config.js)
constantes del dominio: roles, estados de pedido y de producto (src/constants/index.js)
arquitectura por capas: controllers / services / repositories
rutas mínimas
middleware de errores básico
```

Pendiente para los próximos módulos:

```txt
logger profesional
Swagger
tests automatizados
Multer
Docker
```
