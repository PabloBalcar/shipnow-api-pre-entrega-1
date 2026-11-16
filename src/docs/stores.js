/**
 * @openapi
 * tags:
 *   - name: Stores
 *     description: Operaciones para gestionar comercios
 */

/**
 * @openapi
 * /api/stores:
 *   get:
 *     summary: Obtener todos los comercios
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: Comercios obtenidos correctamente
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear un comercio
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - owner
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Comercio Central"
 *               address:
 *                 type: string
 *                 example: "San Martín 500, Paraná"
 *               owner:
 *                 type: string
 *                 example: "672a1b2c3d4e5f6789012345"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Comercio creado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @openapi
 * /api/stores/{sid}:
 *   get:
 *     summary: Obtener un comercio por ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comercio
 *     responses:
 *       200:
 *         description: Comercio obtenido correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Comercio no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   put:
 *     summary: Actualizar un comercio
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comercio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               owner:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Comercio actualizado correctamente
 *       400:
 *         description: Datos o ID inválidos
 *       404:
 *         description: Comercio no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar un comercio
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comercio
 *     responses:
 *       200:
 *         description: Comercio eliminado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Comercio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
