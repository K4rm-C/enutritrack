import { Request, Response, NextFunction } from 'express';
import * as xml2js from 'xml2js';

export const xmlParser = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.get('Content-Type') || '';

  if (
    contentType.includes('application/xml') ||
    contentType.includes('text/xml')
  ) {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      if (data) {
        xml2js.parseString(
          data,
          {
            explicitArray: false,
            ignoreAttrs: false,
            trim: true,
            valueProcessors: [
              xml2js.processors.parseNumbers,
              xml2js.processors.parseBooleans,
            ],
          },
          (err, result) => {
            if (err) {
              console.error('XML parsing error:', err);
              return res.status(400).json({
                success: false,
                error: 'Invalid XML format',
                details: err.message,
              });
            }

            const keys = Object.keys(result);
            const dataKey = keys.find((key) => key !== '?xml');

            if (dataKey) {
              req.body = result[dataKey];
            } else {
              req.body = result;
            }
            next();
          },
        );
      } else {
        next();
      }
    });
  } else {
    next();
  }
};
