import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor funcional que adjunta credenciales a las peticiones salientes.
 * Clona la petición y establece `withCredentials: true`, lo que permite al navegador
 * enviar cookies seguras (como HttpOnly JWTs) al backend.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // En un escenario real, aquí se podría añadir lógica para filtrar
  // las URLs que deben llevar credenciales, por ejemplo, solo las de nuestra API.
  const reqWithCredentials = req.clone({
    withCredentials: true,
  });

  return next(reqWithCredentials);
};
