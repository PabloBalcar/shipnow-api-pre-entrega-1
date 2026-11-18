/**
 * @openapi
 * tags:
 *   - name: Health
 *     description: Verificación del estado de la API y de la base de datos
 */

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verificar el estado de la API
 *     description: Comprueba si la aplicación tiene conexión con MongoDB.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: La aplicación y MongoDB están disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: La aplicación no tiene conexión con MongoDB.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *
 * /api/health:
 *   get:
 *     summary: Verificar el estado de la API mediante la ruta versionada
 *     description: Comprueba si la aplicación tiene conexión con MongoDB.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: La aplicación y MongoDB están disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: La aplicación no tiene conexión con MongoDB.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
