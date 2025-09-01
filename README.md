# BaratongoVzla Frontend - Arquitectura de Vanguardia

![Angular](https://img.shields.io/badge/Angular-v19+-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss)
![SSR](https://img.shields.io/badge/SSR-Nativo-8A2BE2?style=for-the-badge&logo=serverless)
![PWA](https://img.shields.io/badge/PWA-Habilitada-5A0FC8?style=for-the-badge&logo=pwa)

*BaratongoVzla* es una tienda virtual de alto rendimiento construida sobre los pilares más modernos de la arquitectura web. Este proyecto representa el estándar de oro para aplicaciones de e-commerce, priorizando la velocidad, el SEO técnico y una experiencia de usuario (UX) de élite.

> **Filosofía del Proyecto**: "Modernidad Absoluta, Rendimiento como Fundamento". Abominamos los patrones obsoletos y consideramos cualquier enfoque pre-Signals como deuda técnica.

---

# Tabla de Contenidos

1.  [Ecosistema Tecnológico](https://github.com/johngeek2024/baratongovzla-frontend/blob/main/README.md#ecosistema-tecnol%C3%B3gico)
2.  [Arquitectura Angular Moderna](#arquitectura-angular-moderna)
3.  [Estructura de Directorios](#estructura-de-directorios)
4.  [Sistema de Estilos con Tailwind CSS](#sistema-de-estilos-con-tailwind-css)
5.  [Gestión de Estado Reactiva con Signals](#gestión-de-estado-reactiva-con-signals)
6.  [Pilares de Ejecución](#pilares-de-ejecución)
7.  [Instalación y Despliegue](#instalación-y-despliegue)

---

# 1. Ecosistema Tecnológico

La estabilidad del proyecto se garantiza mediante la compatibilidad estricta de las siguientes versiones de nuestro stack:

| Herramienta     | Versión                | Propósito                                       |
| :-------------- | :--------------------- | :---------------------------------------------- |
| *Angular* | `~20.1.7`              | Framework principal para el frontend.           |
| *Node.js* | `LTS (~20.x)`          | Entorno de ejecución para build y SSR.          |
| *TypeScript* | `~5.8.2`               | Lenguaje principal, asegurando un tipado estricto. |
| *Tailwind CSS*| `~3.4.17`              | Framework de estilos Utility-First.             |

---

# 2. Arquitectura Angular Moderna

Este no es el Angular de antes. La aplicación está construida desde cero con los principios más avanzados disponibles.

## Principios Fundamentales

* *100% Standalone*: La arquitectura se basa exclusivamente en *Componentes, Directivas y Pipes Standalone* (`standalone: true`). Los `NgModules` están terminantemente prohibidos y han sido erradicados del proyecto.
* *Zoneless por Defecto*: La aplicación opera en modo *Zoneless*, eliminando la sobrecarga de Zone.js para una detección de cambios más granular y eficiente. Esto se configura en `app.config.ts` con `provideZonelessChangeDetection()`.
* *Server-Side Rendering (SSR) Nativo*: El renderizado en servidor es el punto de partida, no una opción. Garantiza un *First Contentful Paint (FCP)* casi instantáneo y un SEO técnico impecable desde el núcleo.
* *Carga Diferida Declarativa (`@defer`)*: Hacemos un uso intensivo de los bloques `@defer` para optimizar el *Largest Contentful Paint (LCP)* y el *Interaction to Next Paint (INP)*. Los componentes pesados solo se cargan cuando son realmente necesarios (al entrar en el viewport, en interacciones, etc.).

---

## 3. Estructura de Directorios

La organización del código está diseñada para ser intuitiva, escalable y mantenible, siguiendo una estricta separación de responsabilidades.

```bash
src/
└── app/
    ├── core/               # Lógica central y singletons de la aplicación.
    │   ├── services/       # Servicios globales (AuthService, DataStoreService, UiService).
    │   ├── guards/         # Guardianes de rutas (AuthGuard, AdminAuthGuard).
    │   ├── interceptors/   # Interceptores HTTP (ErrorInterceptor, AuthInterceptor).
    │   └── models/         # Interfaces y tipos de datos globales (Product, User).
    │
    ├── components/         # Componentes de UI "tontos", 100% reutilizables.
    │   ├── layout/         # Componentes estructurales (Header, Footer, BottomNav).
    │   └── ui/             # Elementos de UI (Button, Modal, ProductCard).
    │
    ├── features/           # MÓDULOS DE NEGOCIO (cada uno con sus componentes, servicios y rutas).
    │   ├── home/           # Página de inicio.
    │   ├── products/       # Listado y detalle de productos (PLP/PDP).
    │   ├── cart/           # Lógica del carrito de compras.
    │   ├── checkout/       # Proceso de pago.
    │   ├── auth/           # Login, registro.
    │   └── admin/          # Panel de administración.
    │
    ├── shared/             # Pipes y Directivas compartidas, reutilizables y standalone.
    │
    ├── app.config.ts       # Configuración principal (providers, SSR, Zoneless).
    ├── app.routes.ts       # Rutas principales con lazy loading de features.
    └── app.component.ts    # Componente raíz (AppComponent).
```

---

# 4. Sistema de Estilos con Tailwind CSS

No se escribe CSS tradicional. Toda la estilización se gestiona a través de las clases de utilidad de Tailwind CSS, promoviendo la consistencia y la rapidez en el desarrollo.

* *Configuración Centralizada*: El archivo `tailwind.config.ts` es el *centro neurálgico del sistema de diseño visual*. Define todos los tokens de diseño:
    * `colors`: Paleta de colores semántica (ej. `primary-accent`, `dark-bg`).
    * `fontFamily`: Tipografías para texto general (`sans`) y encabezados (`headings`).
    * `keyframes` y `animation`: Animaciones personalizadas reutilizables (ej. `fade-in-up`).
* *CSS Global Mínimo*: El archivo `src/styles.css` solo contiene las tres directivas base de Tailwind: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`. No se permite CSS personalizado aquí.

---

# 5. Gestión de Estado Reactiva con Signals

La reactividad de la aplicación es impulsada exclusivamente por *Angular Signals*. Este enfoque moderno simplifica la gestión del estado, elimina la necesidad de librerías externas complejas y mejora el rendimiento.

* *Estado Centralizado*: Servicios como `UiService` y `ProductService` exponen señales (`signal()`) que representan el estado de la aplicación (ej. `isMenuPanelOpen`, `searchQuery`).
* *Estado Derivado*: Se utilizan señales computadas (`computed()`) para derivar valores a partir de otras señales. Por ejemplo, `filteredProducts` en `ProductService` se recalcula automáticamente solo cuando una de sus dependencias (filtros, categoría activa) cambia.
* *Efectos Secundarios*: Los `effect()` se usan para reaccionar a cambios de estado y ejecutar lógica que interactúa con el exterior, como guardar datos en `localStorage` o registrar en la consola.
* *Signal Store (`@ngrx/signals`)*: Para lógica de estado más compleja y autocontenida, como el carrito de compras (`CartStore`), utilizamos `@ngrx/signals`. Proporciona una estructura clara con `withState`, `withComputed` y `withMethods` para un manejo de estado robusto y predecible.

---

# 6. Pilares de Ejecución

## Dominancia SEO Absoluta

* *SSR Nativo*: Garantiza que los motores de búsqueda reciban HTML completamente renderizado.
* *URLs Semánticas*: Rutas claras y descriptivas (ej. `/product/hyperion-x1-proyector-4k`).
* *Metadatos Dinámicos*: `SeoService` actualiza dinámicamente el título y las metaetiquetas (`description`, `og:title`, etc.) para cada página.
* *Datos Estructurados (Schema.org)*: Se inyecta JSON-LD en las páginas de producto para enriquecer los resultados de búsqueda.
* *Sitemap.xml y Robots.txt*: Generados dinámicamente para una indexación óptima.

### PWA Mobile-First Definitiva

* *Diseño Mobile-First*: La interfaz se diseña priorizando la experiencia en pantallas pequeñas, con una *Barra de Navegación Inferior Fija (Tab Bar)* como elemento central.
* *Adaptabilidad Total*: El diseño es completamente responsivo y se adapta a tablets y escritorios usando los breakpoints de Tailwind (`sm:`, `md:`, `lg:`).
* *Capacidades PWA*:
    * *Instalable*: La aplicación puede ser añadida a la pantalla de inicio.
    * *Funcionamiento Offline*: El Service Worker (`ngsw-config.json`) cachea recursos estáticos y productos visitados para una experiencia offline fluida.

---

# 7. Instalación y Despliegue

## Servidor de Desarrollo

1.  Clona el repositorio.
2.  Instala las dependencias: `npm install`
3.  Inicia el servidor de desarrollo: `npm start`
4.  Abre tu navegador en `http://localhost:4200/`.

## Build de Producción

1.  Ejecuta el comando de build: `npm run build`
2.  Los artefactos optimizados se generarán en la carpeta `dist/baratongovzla-frontend/`.

## Servir la Aplicación SSR

Después de un build exitoso, puedes iniciar el servidor de Node.js para probar la versión de producción con SSR activado:

```bash
npm run serve:ssr:baratongovzla-frontend
