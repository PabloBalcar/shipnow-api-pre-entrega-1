/**
 * @openapi
 * tags:
 *   - name: Logger
 *     description: Herramientas para comprobar los niveles de registro de Winston
 */

/**
 * @openapi
 * /api/logger/test:
 *   get:
 *     summary: Ejecutar prueba de niveles de Winston
 *     description: Ejecuta una prueba de los seis niveles configurados en Winston. Disponible únicamente fuera del entorno de producción.
 *     tags: [Logger]
 *     responses:
 *       200:
 *         description: Prueba de logging ejecutada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Prueba de los seis niveles de Winston ejecutada correctamente
 *                 levels:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [debug, http, info, warning, error, fatal]
 *       500:
 *         description: Error interno del servidor
 */
