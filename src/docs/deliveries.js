/**
 * @openapi
 * tags:
 *   - name: Deliveries
 *     description: Gestión y seguimiento de entregas
 */

/**
 * @openapi
 * /api/deliveries:
 *   get:
 *     summary: Obtener entregas con paginación
 *     tags: [Deliveries]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Entregas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Delivery"
 *                 pagination:
 *                   type: object
 *       400:
 *         description: Parámetros de paginación inválidos
 *
 *   post:
 *     summary: Crear una entrega para un pedido
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: string
 *                 example: "672a1b2c3d4e5f6789012345"
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Entrega preparada para asignación"
 *     responses:
 *       201:
 *         description: Entrega creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       400:
 *         description: Pedido no disponible o datos inválidos
 *       404:
 *         description: Pedido no encontrado
 *       409:
 *         description: El pedido ya tiene una entrega
 */

/**
 * @openapi
 * /api/deliveries/{did}:
 *   get:
 *     summary: Obtener una entrega por ID
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entrega obtenida correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Entrega no encontrada
 */

/**
 * @openapi
 * /api/deliveries/{did}/assign:
 *   put:
 *     summary: Asignar un repartidor a una entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courier]
 *             properties:
 *               courier:
 *                 type: string
 *                 example: "672a1b2c3d4e5f6789012346"
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Repartidor asignado"
 *     responses:
 *       200:
 *         description: Repartidor asignado correctamente
 *       400:
 *         description: Repartidor inválido o transición no permitida
 *       404:
 *         description: Entrega no encontrada
 */

/**
 * @openapi
 * /api/deliveries/{did}/status:
 *   put:
 *     summary: Actualizar el estado de una entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [picked_up, in_transit, delivered, cancelled]
 *                 example: picked_up
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 example: "El pedido fue retirado del comercio"
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Estado inválido o transición no permitida
 *       404:
 *         description: Entrega no encontrada
 */

/**
 * @openapi
 * /api/deliveries/{did}/tracking:
 *   get:
 *     summary: Consultar el seguimiento y el historial de una entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seguimiento obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   $ref: "#/components/schemas/Delivery"
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Entrega no encontrada
 */

/**
 * @openapi
 * /api/deliveries/{did}/proof:
 *   post:
 *     summary: Cargar un comprobante de entrega
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - proof
 *             properties:
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: Comprobante PDF, JPEG, PNG o WEBP (máximo 5 MB)
 *     responses:
 *       200:
 *         description: Comprobante cargado correctamente
 *       400:
 *         description: Archivo faltante, tipo no permitido o contenido inválido
 *       404:
 *         description: Entrega no encontrada
 */
