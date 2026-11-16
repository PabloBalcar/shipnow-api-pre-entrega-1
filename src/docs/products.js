/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Operaciones para gestionar productos
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Obtener productos
 *     description: Por defecto devuelve productos disponibles. Se puede incluir el stock agotado mediante includeOutOfStock y filtrar por comercio.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: includeOutOfStock
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Si es true, incluye productos sin stock
 *       - in: query
 *         name: store
 *         schema:
 *           type: string
 *         required: false
 *         description: ID del comercio para filtrar productos
 *     responses:
 *       200:
 *         description: Productos obtenidos correctamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear un producto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - store
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Hamburguesa completa"
 *               description:
 *                 type: string
 *                 example: "Hamburguesa con queso y vegetales"
 *               price:
 *                 type: number
 *                 example: 8500
 *               stock:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *               store:
 *                 type: string
 *                 example: "672a1b2c3d4e5f6789012346"
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       400:
 *         description: Datos o stock inválidos
 *       404:
 *         description: Comercio no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @openapi
 * /api/products/{pid}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *                 minimum: 0
 *               store:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       400:
 *         description: Datos o ID inválidos
 *       404:
 *         description: Producto o comercio no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
