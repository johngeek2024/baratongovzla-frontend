import * as dotenv from 'dotenv';
dotenv.config();

import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import webpush from 'web-push';
import bodyParser from 'body-parser';

import { Product } from './app/core/models/product.model';
import { environment } from './environments/environment';

// --- Validación VAPID Crítica al Arranque ---
if (!process.env['VAPID_PRIVATE_KEY']) {
  console.error('ERROR FATAL: La variable de entorno VAPID_PRIVATE_KEY no está definida.');
  process.exit(1);
}

// --- Configuración Inicial del Servidor ---
const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:4200", methods: ["GET", "POST"], credentials: true }
});

// --- Lógica de Socket.IO ---
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);
  socket.on('join-product-room', (productId: string) => socket.join(productId));
  socket.on('leave-product-room', (productId: string) => socket.leave(productId));
  socket.on('disconnect', () => console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`));
});

// =======================================================
// ORDEN DE MIDDLEWARE NO NEGOCIABLE
// =======================================================

// 1. Router para la API con su propio middleware de parsing
const apiRouter = express.Router();
apiRouter.use(bodyParser.json());

// ✅ INICIO: CORRECCIÓN DEFINITIVA DE ENDPOINTS DE AUTENTICACIÓN
// Se añade el endpoint GET faltante para el chequeo de estado de la sesión.
apiRouter.get('/auth/status', (req, res) => {
  // Simula un usuario no autenticado por defecto.
  res.status(200).json({ user: null, admin: null });
});

// Se corrigen los endpoints POST para devolver JSON en caso de error 401.
apiRouter.post('/auth/login', (req, res) => {
  res.status(401).json({ success: false, message: 'Credenciales inválidas' });
});

apiRouter.post('/auth/admin/login', (req, res) => {
  res.status(401).json({ success: false, message: 'Credenciales de administrador inválidas' });
});
// ✅ FIN: CORRECCIÓN DEFINITIVA

// Configuración de Notificaciones Push
const vapidKeys = {
    publicKey: environment.vapidPublicKey,
    privateKey: process.env['VAPID_PRIVATE_KEY']!
};
webpush.setVapidDetails('mailto:soporte@baratongovzla.com', vapidKeys.publicKey, vapidKeys.privateKey);
let subscriptions: webpush.PushSubscription[] = [];

apiRouter.post('/notifications/subscribe', (req, res) => {
    subscriptions.push(req.body);
    res.status(201).json({ message: 'Suscripción guardada.' });
});

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

app.use('/api', apiRouter);

// 2. Manejador explícito para el Service Worker
app.get('/ngsw-worker.js', (req, res) => {
  res.sendFile(join(browserDistFolder, 'ngsw-worker.js'));
});

// 3. Servir el resto de archivos estáticos (JS, CSS, imágenes)
app.use(express.static(browserDistFolder, { maxAge: '1y', index: false }));

// 4. Servir el Sitemap
app.get('/sitemap.xml', (req, res) => {
    const products = getProductsFromDisk();
    const urls = products
      .filter(p => p.status === 'Publicado')
      .map(p => `<url><loc>https://baratongovzla.com/product/${p.slug}</loc><lastmod>${new Date().toISOString()}</lastmod><priority>0.8</priority></url>`)
      .join('');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://baratongovzla.com/</loc><lastmod>${new Date().toISOString()}</lastmod><priority>1.0</priority></url>${urls}</urlset>`;
    res.header('Content-Type', 'application/xml').send(sitemap);
});

// 5. Manejador de Angular (Catch-All para SSR)
app.use((req, res, next) => {
  angularApp.handle(req).then((response) =>
    response ? writeResponseToNodeResponse(response, res) : next()
  ).catch(next);
});

// --- Arranque del Servidor ---
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  httpServer.listen(port, () => {
    console.log(`Servidor Node Express con SSR y Socket.IO escuchando en http://localhost:${port}`);
  });
}

// Helper para leer productos
function getProductsFromDisk(): Product[] {
  try {
    const jsonPath = join(browserDistFolder, 'assets/data/products.json');
    const productsJson = readFileSync(jsonPath, 'utf-8');
    return JSON.parse(productsJson);
  } catch (error) {
    console.error('Error leyendo products.json desde el disco:', error);
    return [];
  }
}

export const reqHandler = createNodeRequestHandler(app);
