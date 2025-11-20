import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Access localStorage directly to avoid circular dependency
  const token = localStorage.getItem('loopa_token');

  // Don't add Authorization header for auth endpoints
  const isAuthEndpoint = req.url.includes('/users/auth/');

  if (token && !isAuthEndpoint) {
    // Clone the request and add the Authorization header
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
