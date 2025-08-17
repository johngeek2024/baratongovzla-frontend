import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { DataStoreService } from './app/core/services/data-store.service';
import { Product } from './app/core/models/product.model';
// ✅ AÑADIDO: Importaciones para Web Push y Body Parser
import webpush from 'web-push';
import bodyParser from 'body-parser';
import { secrets } from './environments/secrets'; // Importamos nuestros secretos

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ✅ AÑADIDO: Middleware para parsear el body de las peticiones a JSON
app.use(bodyParser.json());

// ✅ INICIO: LÓGICA DEL BACKEND PARA NOTIFICACIONES PUSH
// =======================================================

const vapidKeys = {
  publicKey: secrets.vapid.publicKey,
  privateKey: secrets.vapid.privateKey
};

webpush.setVapidDetails(
  'mailto:tu-email@baratongovzla.com', // Reemplaza con tu email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Almacén de suscripciones en memoria (para desarrollo)
let subscriptions: webpush.PushSubscription[] = [];

// Endpoint para guardar una nueva suscripción
app.post('/api/notifications/subscribe', (req, res) => {
  const sub = req.body;
  console.log('Suscripción recibida en el backend:', sub);
  subscriptions.push(sub);
  res.status(201).json({ message: 'Suscripción guardada con éxito.' });
});

// Endpoint para disparar una notificación de prueba a todos los suscritos
app.post('/api/notifications/trigger', (req, res) => {
  console.log('Disparando notificaciones...');
  const notificationPayload = {
    notification: {
      title: '¡Oferta Flash en BaratongoVzla!',
      body: 'El Teclado Void-Dasher tiene 20% de descuento. ¡Solo por hoy!',
      icon: 'assets/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: '/product/teclado-mecanico-void-dasher'
      }
    }
  };

  Promise.all(subscriptions.map(sub => webpush.sendNotification(sub, JSON.stringify(notificationPayload))))
    .then(() => res.status(200).json({ message: 'Notificaciones enviadas.' }))
    .catch(err => {
      console.error("Error enviando notificación:", err);
      res.sendStatus(500);
    });
});
// =======================================================
// ✅ FIN: LÓGICA DEL BACKEND PARA NOTIFICACIONES PUSH

// Ruta para el Sitemap Dinámico (código existente)
app.get('/sitemap.xml', (req, res) => {
  const dataStore = new DataStoreService();
  const products: Product[] = dataStore.products();
  const urls = products
    .filter(p => p.status === 'Publicado')
    .map(p => `
    <url>
      <loc>https://baratongovzla.com/product/${p.slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>0.8</priority>
    </url>
  `).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://baratongovzla.com/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1.0</priority>
      </url>
      ${urls}
    </urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error?: any) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI.
 */
export const reqHandler = createNodeRequestHandler(app);
