import { trigger, transition, style, query, group, animate } from '@angular/animations';

export const routeAnimation =
  trigger('routeAnimation', [
    // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
    // Transición para la carga INICIAL de cualquier componente.
    // El estado ':enter' se refiere a cuando el componente entra en la vista por primera vez.
    // Esta animación es instantánea (duración 0) para que la página aparezca inmediatamente.
    transition(':enter', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 1 // El componente es visible desde el primer momento.
      }),
      // Animar a opacidad 1 en 0ms para evitar cualquier parpadeo.
      animate('0ms', style({ opacity: 1 }))
    ]),
    // ✅ FIN: CORRECCIÓN QUIRÚRGICA

    // Transición para la NAVEGACIÓN ENTRE RUTAS ('* <=> *').
    // Esto se activa solo cuando se cambia de una ruta existente a otra.
    transition('* <=> *', [
      // Establece el estado inicial para ambas vistas
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ], { optional: true }),

      // Define el estado inicial de la nueva vista (:enter) antes de que entre
      query(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        })
      ], { optional: true }),

      // Ejecuta las animaciones de salida y entrada en paralelo
      group([
        // Animación para la vista que sale (:leave)
        query(':leave', [
          animate('300ms ease-out', style({
            opacity: 0,
            transform: 'translateY(-20px)'
          }))
        ], { optional: true }),

        // Animación para la vista que entra (:enter)
        query(':enter', [
          animate('300ms ease-out', style({
            opacity: 1,
            transform: 'translateY(0)'
          }))
        ], { optional: true })
      ]),
    ])
  ]);
