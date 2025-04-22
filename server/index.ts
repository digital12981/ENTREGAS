import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Em produção, importar os utilitários de correção de caminhos
if (process.env.NODE_ENV === 'production') {
  try {
    // Usar require dinâmico ou importação condicional para evitar erros
    // em ambiente de desenvolvimento
    import('./public-path-fix.js').then(module => {
      console.log('[server] Aplicando correções de caminho para ambiente de produção...');
      module.ensurePublicDirectory();
    }).catch(err => {
      console.warn('[server] Aviso: Não foi possível carregar o módulo de correção de caminhos:', err.message);
    });
  } catch (err) {
    console.warn('[server] Aviso: Erro ao importar módulo de correção:', err);
  }
}

const app = express();
// Configuração para utilizar UTF-8 na aplicação
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Configurar cabeçalhos para UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`[ERROR HANDLER] ${status} ${message}`);
    console.error(err.stack);
    
    // Responder com o erro formatado como JSON
    res.status(status).json({ 
      error: message,
      status: status,
      timestamp: new Date().toISOString()
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Tentar usar módulo alternativo de servir estáticos
    try {
      import('./alternative-static.js').then(module => {
        log('Usando módulo alternativo para servir arquivos estáticos');
        module.setupAlternativeStatic(app);
      }).catch(err => {
        log(`Erro ao carregar módulo alternativo: ${err.message}`);
        // Fallback para o módulo padrão
        serveStatic(app);
      });
    } catch (err) {
      log(`Módulo alternativo não disponível: ${err}`);
      serveStatic(app);
    }
  }

  // Suporte para porta configurável (Heroku atribui a porta via PORT)
  // Isso serve tanto para a API quanto para o cliente.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  // Log de variáveis de ambiente importantes
  log(`Environment: ${app.get("env")}`);
  log(`PORT: ${process.env.PORT || 'not set, using default 5000'}`);
  log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
  log(`FOR4PAYMENTS_SECRET_KEY: ${process.env.FOR4PAYMENTS_SECRET_KEY ? 'configured' : 'not configured'}`);
  log(`FOR4PAYMENTS_API_URL: ${process.env.FOR4PAYMENTS_API_URL || 'not configured'}`);
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server started successfully on port ${port}`);
  });
})();
