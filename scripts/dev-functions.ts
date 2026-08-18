import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Simple .env loader without third-party dependencies
function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      }
    }
    console.log('[LOCAL RUNNER] Loaded .env file.');
  } else {
    console.log('[LOCAL RUNNER] No .env file found in root. Using process.env.');
  }
}

async function startServer() {
  loadEnv();

  // Check if OPENROUTER_API_KEY is configured
  const hasKey = Boolean(process.env['OPENROUTER_API_KEY'] && process.env['OPENROUTER_API_KEY'].trim() !== '');
  console.log(`[LOCAL RUNNER] OPENROUTER_API_KEY: ${hasKey ? 'CONFIGURED' : 'NOT CONFIGURED'}`);

  // Import the exact chat handler
  const chatModulePath = pathToFileURL(path.join(projectRoot, 'netlify', 'functions', 'chat.ts')).href;
  const { handler } = await import(chatModulePath);

  const PORT = process.env['FUNCTIONS_PORT'] || 8888;

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    
    if (url.pathname === '/.netlify/functions/chat' || url.pathname === '/api/chat') {
      let rawBody = '';
      req.on('data', (chunk) => {
        rawBody += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const event = {
            httpMethod: req.method || 'GET',
            headers: req.headers as Record<string, string | undefined>,
            body: rawBody || null,
            path: url.pathname,
            queryStringParameters: Object.fromEntries(url.searchParams.entries()),
          };

          const result = await handler(event as any, {} as any);

          if (result.headers) {
            for (const [k, v] of Object.entries(result.headers)) {
              res.setHeader(k, v as string);
            }
          }

          res.statusCode = result.statusCode || 200;
          res.end(result.body || '');
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'INTERNAL_ERROR', message: 'Local runner error' }));
        }
      });
    } else {
      res.statusCode = 404;
      res.end('Not found. Local Netlify function is listening on /.netlify/functions/chat');
    }
  });

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Local Netlify Functions Server listening on:`);
    console.log(`   http://localhost:${PORT}/.netlify/functions/chat`);
    console.log(`======================================================\n`);
  });
}

startServer().catch(console.error);
