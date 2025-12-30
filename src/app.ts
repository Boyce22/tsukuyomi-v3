import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import express, { Application, Request, Response } from 'express';

import { env } from '@config';
import { logger } from '@utils';
import { errorHandler, rateLimiter, requestLogger } from '@middlewares';

import routes from './routes';

class App {
  private static instance: App;
  private readonly application: Application;

  private constructor() {
    this.application = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  getApplication(): Application {
    return this.application;
  }

  private setupMiddlewares(): void {
    this.application.disable('x-powered-by');
    this.application.set('trust proxy', 1);

    this.application.use(
      helmet({
        contentSecurityPolicy: env.NODE_ENV === 'production',
      })
    );

    this.application.use(
      cors({
        origin: env.CORS_ORIGIN || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      })
    );

    this.application.use(compression());
    this.application.use(express.json({ limit: '10mb' }));
    this.application.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.application.use(requestLogger);

    if (env.NODE_ENV === 'production') {
      this.application.use(rateLimiter);
    }
  }

  private setupRoutes(): void {
    this.application.get('/health', this.healthCheck);
    this.application.get('/', this.rootEndpoint);
    this.application.use('/api', routes);
  }

  private healthCheck(_req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  }

  private rootEndpoint(_req: Request, res: Response): void {
    res.json({
      name: env.APP_NAME || 'API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    });
  }

  private setupErrorHandling(): void {
    this.application.use((req: Request, res: Response) => {
      logger.warn('Route not found', {
        method: req.method,
        path: req.path,
      });

      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
      });
    });

    this.application.use(errorHandler);
  }
}

export default App.getInstance().getApplication();
