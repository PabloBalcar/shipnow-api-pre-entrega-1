/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Operaciones para gestionar pedidos
 */

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Obtener todos los pedidos
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Pedidos obtenidos correctamente
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear un pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - store
 *               - items
 *               - deliveryAddress
 *             properties:
 *               customer:
 *                 type: string
 *                 example: "672a1b2c3d4e5f6789012345"
 *               store:
 *                 type: string
 *                 example: "672a1b2c3d4e5f6789012346"
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               deliveryAddress:
 *                 type: string
 *                 example: "Av. Ramírez 123, Paraná"
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high]
 *                 default: normal
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *       400:
 *         description: Faltan campos obligatorios o los items son inválidos
 *       404:
 *         description: Usuario o comercio no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @openapi
 * /api/orders/{oid}:
 *   get:
 *     summary: Obtener un pedido por ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: oid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido obtenido correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: oid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido eliminado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @openapi
 * /api/orders/{oid}/status:
 *   put:
 *     summary: Actualizar el estado de un pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: oid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [created, assigned, picked_up, in_transit, delivered, cancelled]
 *                 example: in_transit
 *     responses:
 *       200:
 *         description: Estado del pedido actualizado correctamente
 *       400:
 *         description: ID o estado inválido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
