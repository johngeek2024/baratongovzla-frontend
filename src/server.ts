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
import webpush from 'web-push';
import bodyParser from 'body-parser';
// CORRECCIÓN: Se importa 'environment' para la clave pública.
import { environment } from './environments/environment';

// CORRECCIÓN CRÍTICA: Añadir un chequeo para asegurar que la variable de entorno de la clave privada exista.
if (!process.env['VAPID_PRIVATE_KEY']) {
  console.error('ERROR FATAL: La variable de entorno VAPID_PRIVATE_KEY no está definida.');
  process.exit(1); // Detiene el servidor si el secreto no está configurado.
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(bodyParser.json());

// =======================================================
// LÓGICA DEL BACKEND PARA NOTIFICACIONES PUSH (CORREGIDA)
// =======================================================

const vapidKeys = {
  // CORRECCIÓN: La clave pública se toma de la configuración de entorno de Angular.
  publicKey: environment.vapidPublicKey,
  // CORRECCIÓN: La clave privada se toma de las variables de entorno del servidor.
  privateKey: process.env['VAPID_PRIVATE_KEY']
};

webpush.setVapidDetails(
  'mailto:soporte@baratongovzla.com', // Un email de contacto real.
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions: webpush.PushSubscription[] = [];

app.post('/api/notifications/subscribe', (req, res) => {
  const sub = req.body;
  console.log('Suscripción recibida en el backend:', sub);
  subscriptions.push(sub);
  res.status(201).json({ message: 'Suscripción guardada con éxito.' });
});

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
// FIN DE LA LÓGICA DE NOTIFICACIONES
// =======================================================

// Ruta para el Sitemap Dinámico (sin cambios)
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

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error?: any) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
