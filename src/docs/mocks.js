/**
 * @openapi
 * tags:
 *   - name: Mocks
 *     description: Generación y consulta de datos simulados
 *   - name: Deliveries
 *     description: Consulta de entregas generadas mediante el módulo de mocks
 */

/**
 * @openapi
 * /api/mocks/users:
 *   get:
 *     summary: Obtener usuarios simulados
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         description: Cantidad de usuarios a generar
 *     responses:
 *       200:
 *         description: Usuarios simulados obtenidos correctamente
 *       400:
 *         description: Cantidad inválida
 *       500:
 *         description: Error al generar los datos simulados
 */

/**
 * @openapi
 * /api/mocks/couriers:
 *   get:
 *     summary: Obtener repartidores simulados
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         description: Cantidad de repartidores a generar
 *     responses:
 *       200:
 *         description: Repartidores simulados obtenidos correctamente
 *       400:
 *         description: Cantidad inválida
 *       500:
 *         description: Error al generar los datos simulados
 */

/**
 * @openapi
 * /api/mocks/orders:
 *   get:
 *     summary: Obtener pedidos simulados
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         description: Cantidad de pedidos a generar
 *     responses:
 *       200:
 *         description: Pedidos simulados obtenidos correctamente
 *       400:
 *         description: Cantidad inválida
 *       500:
 *         description: Error al generar los datos simulados
 */

/**
 * @openapi
 * /api/mocks/deliveries:
 *   get:
 *     summary: Obtener entregas simuladas
 *     description: Este endpoint pertenece al módulo de mocks. No representa una ruta CRUD de entregas.
 *     tags: [Mocks, Deliveries]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         description: Cantidad de entregas a generar
 *     responses:
 *       200:
 *         description: Entregas simuladas obtenidas correctamente
 *       400:
 *         description: Cantidad inválida
 *       500:
 *         description: Error al generar los datos simulados
 */

/**
 * @openapi
 * /api/mocks/seed:
 *   post:
 *     summary: Insertar datos simulados en la base de datos
 *     description: Genera e inserta usuarios, repartidores, comercios, pedidos y entregas relacionados. La cantidad se configura mediante el parámetro qty.
 *     tags: [Mocks]
 *     parameters:
 *       - in: query
 *         name: qty
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         description: Cantidad de conjuntos de datos a insertar
 *     responses:
 *       201:
 *         description: Datos simulados insertados correctamente
 *       400:
 *         description: Cantidad inválida
 *       500:
 *         description: Error al generar o insertar los datos simulados
 */
