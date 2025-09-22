import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as js2xmlparser from 'js2xmlparser';

@Injectable()
export class XmlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const acceptHeader = request.get('accept') || '';

    return next.handle().pipe(
      map((data) => {
        if (
          acceptHeader.includes('application/xml') ||
          acceptHeader.includes('text/xml')
        ) {
          const xmlData = this.convertToXml(data, request.url);
          response.set('Content-Type', 'application/xml; charset=utf-8');
          return xmlData;
        }
        return data;
      }),
    );
  }

  private convertToXml(data: any, url: string): string {
    const sanitizedData = this.sanitizeForXml(data);

    // Mapeo de rutas a elementos XML
    const routeMapping = {
      '/users': { single: 'user', multiple: 'users' },
      '/doctors': { single: 'doctor', multiple: 'doctors' },
      '/nutrition': {
        single: 'nutrition_record',
        multiple: 'nutrition_records',
      },
      '/recommendations': {
        single: 'recommendation',
        multiple: 'recommendations',
      },
      '/physical-activity': {
        single: 'physical-activity',
        multiple: 'physicals-activitys',
      },
      '/auth': { single: 'auth', multiple: 'auths' },
    };

    // Encontrar la ruta correspondiente
    const matchedRoute = Object.keys(routeMapping).find((route) =>
      url.includes(route),
    );

    let rootElement = 'response';
    let childElement = 'item';

    if (matchedRoute) {
      const mapping = routeMapping[matchedRoute];
      if (Array.isArray(sanitizedData)) {
        rootElement = mapping.multiple;
        childElement = mapping.single;
      } else {
        rootElement = mapping.single;
      }
    }

    // Generar XML
    if (Array.isArray(sanitizedData)) {
      return js2xmlparser.parse(
        rootElement,
        {
          [childElement]: sanitizedData,
        },
        this.getXmlOptions(),
      );
    } else {
      return js2xmlparser.parse(
        rootElement,
        sanitizedData,
        this.getXmlOptions(),
      );
    }
  }

  private sanitizeForXml(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeForXml(item));
    }

    const sanitized = { ...data };

    // Remover campos sensibles
    const sensitiveFields = [
      'contraseñaHash',
      'contraseña',
      'password',
      'passwordHash',
      'token',
      'refreshToken',
      'secret',
      'privateKey',
    ];

    sensitiveFields.forEach((field) => {
      delete sanitized[field];
    });

    // Convertir fechas a strings y manejar valores especiales
    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key] instanceof Date) {
        sanitized[key] = sanitized[key].toISOString();
      }
      if (sanitized[key] === null || sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  private getXmlOptions() {
    return {
      declaration: {
        encoding: 'UTF-8',
        version: '1.0',
      },
      format: {
        indent: '  ',
        newline: '\n',
      },
    };
  }
}
