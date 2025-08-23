// Cargar variables de entorno locales desde el archivo .env
import * as dotenv from 'dotenv';
dotenv.config();

import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { DataStoreService } from './app/core/services/data-store.service';
import { Product } from './app/core/models/product.model';
import webpush from 'web-push';
import bodyParser from 'body-parser';
import { environment } from './environments/environment';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { readFileSync } from 'node:fs';
import { Injector } from '@angular/core';

// Chequeo VAPID
if (!process.env['VAPID_PRIVATE_KEY']) {
  console.error('ERROR FATAL: La variable de entorno VAPID_PRIVATE_KEY no está definida.');
  process.exit(1);
}

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:4200", methods: ["GET", "POST"], credentials: true }
});

// Lógica de Conexión de Socket.IO
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);
  socket.on('join-product-room', (productId: string) => socket.join(productId));
  socket.on('leave-product-room', (productId: string) => socket.leave(productId));
  socket.on('disconnect', () => console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`));
});


// ✅ INICIO: CORRECCIÓN DE ORDEN DE MIDDLEWARE
// =======================================================
// SECCIÓN DE API - Debe ir ANTES del manejador de Angular
// =======================================================

// 1. Aplicar bodyParser SÓLO a las rutas de la API
const apiRouter = express.Router();
apiRouter.use(bodyParser.json());

// Lógica para leer datos de productos
function getProductsFromDisk(): Product[] {
  try {
    const jsonPath = join(process.cwd(), 'dist/baratongovzla-frontend/browser/assets/data/products.json');
    const productsJson = readFileSync(jsonPath, 'utf-8');
    return JSON.parse(productsJson);
  } catch (error) {
    console.error('Error leyendo products.json desde el disco:', error);
    return [];
  }
}

// Endpoints de Autenticación (simulados)
apiRouter.post('/auth/login', (req, res) => res.sendStatus(401));
apiRouter.post('/auth/admin/login', (req, res) => res.sendStatus(401));

// Lógica de Notificaciones Push
const vapidKeys = {
    publicKey: environment.vapidPublicKey,
    privateKey: process.env['VAPID_PRIVATE_KEY']
};
webpush.setVapidDetails('mailto:soporte@baratongovzla.com', vapidKeys.publicKey, vapidKeys.privateKey);
let subscriptions: webpush.PushSubscription[] = [];
apiRouter.post('/notifications/subscribe', (req, res) => {
    const sub = req.body;
    subscriptions.push(sub);
    res.status(201).json({ message: 'Suscripción guardada con éxito.' });
});

// Endpoints que emiten eventos de WebSocket
const CRITICAL_STOCK_THRESHOLD = 5;

apiRouter.post('/orders/create', (req, res) => {
  const order = req.body as any;
  io.emit('admin:new-order', { orderId: order.id, customerName: order.customerName, total: order.total });

  const allProducts = getProductsFromDisk();
  order.items.forEach((item: { product: Product, quantity: number }) => {
    const product = allProducts.find(p => p.id === item.product.id);
    if (product) {
      const newStock = product.stock - item.quantity;
      io.to(product.id).emit('product:stock-update', { productId: product.id, newStock });
      if (newStock <= CRITICAL_STOCK_THRESHOLD && product.stock > CRITICAL_STOCK_THRESHOLD) {
        io.emit('admin:stock-alert', { productName: product.name, newStock });
      }
    }
  });
  res.status(201).json({ message: 'Pedido creado y notificaciones enviadas.' });
});

apiRouter.post('/auth/register-notify', (req, res) => {
  const user = req.body as any;
  io.emit('admin:new-customer', { fullName: user.fullName, email: user.email });
  res.status(201).json({ message: 'Cliente registrado y notificación enviada.' });
});

// 2. Usar el router de la API
app.use('/api', apiRouter);

// =======================================================
// FIN DE LA SECCIÓN DE API
// =======================================================
// ✅ FIN: CORRECCIÓN DE ORDEN DE MIDDLEWARE

// Sitemap (No necesita bodyParser, puede ir aquí)
app.get('/sitemap.xml', (req, res) => {
    const products = getProductsFromDisk();
    const urls = products
      .filter(p => p.status === 'Publicado')
      .map(p => `<url><loc>https://baratongovzla.com/product/${p.slug}</loc><lastmod>${new Date().toISOString()}</lastmod><priority>0.8</priority></url>`)
      .join('');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://baratongovzla.com/</loc><lastmod>${new Date().toISOString()}</lastmod><priority>1.0</priority></url>
${urls}
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

// Servir archivos estáticos y manejar rutas de Angular
app.use(express.static(browserDistFolder, { maxAge: '1y', index: false, redirect: false }));
app.use((req, res, next) => {
  angularApp.handle(req).then((response) =>
    response ? writeResponseToNodeResponse(response, res) : next()
  ).catch(next);
});

// Iniciar servidor
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  httpServer.listen(port, () => {
    console.log(`Node Express server con Socket.IO escuchando en http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
