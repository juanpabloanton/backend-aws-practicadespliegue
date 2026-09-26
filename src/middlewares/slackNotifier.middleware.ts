import type { Request, Response, NextFunction } from 'express';

// URL del webhook de Slack (Incoming Webhook). Vive en .env, nunca se commitea.
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Middleware que notifica a un canal de Slack por cada petición HTTP recibida,
 * incluyendo el método, la ruta, el código de estado devuelto y el tiempo de respuesta.
 *
 * El envío al webhook es "fire and forget": no se espera (await) su resultado
 * para no demorar la respuesta al cliente, y cualquier error de red hacia Slack
 * se registra en consola sin interrumpir el flujo normal de la petición.
 */
export const slackNotifier = (req: Request, res: Response, next: NextFunction): void => {
  if (!SLACK_WEBHOOK_URL) {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const emoji = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
    const text = `${emoji} \`${req.method}\` ${req.originalUrl} → *${res.statusCode}* (${durationMs}ms)`;

    fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error('⚠️ [SlackNotifier]: no se pudo enviar la notificación:', message);
    });
  });

  next();
};
