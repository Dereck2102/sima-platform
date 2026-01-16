import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Tenant Context Interceptor
 * Extracts tenantId from authenticated user and makes it available in the request
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Extract tenantId from authenticated user (set by JWT strategy)
    if (request.user && request.user.tenantId) {
      request.tenantId = request.user.tenantId;
    }

    return next.handle();
  }
}

/**
 * Helper to get current tenant ID from request
 */
export function getCurrentTenantId(request: any): string | null {
  return request.tenantId || request.user?.tenantId || null;
}
