import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    _ctx: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Nếu service trả về object có key "data" và "meta" thì unwrap
        if (
          data &&
          typeof data === 'object' &&
          'data' in (data as object) &&
          'meta' in (data as object)
        ) {
          const { data: innerData, meta } = data as any;
          return { success: true, data: innerData, meta };
        }
        return { success: true, data };
      }),
    );
  }
}
