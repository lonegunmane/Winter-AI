import 'dotenv/config';
import express, { Request, Response } from 'express';
import http from 'http';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Health / Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Winter',
    hasServerKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    recommendedModel: 'gemini-2.0-flash',
  });
});

// Chat stream endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model, temperature, systemInstruction, customApiKey } = req.body;

  const resolvedApiKey =
    customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 0
      ? customApiKey.trim()
      : process.env.GEMINI_API_KEY;

  if (!resolvedApiKey || resolvedApiKey === 'MY_GEMINI_API_KEY') {
    res.status(400).json({
      error:
        'No Winter Cloud API key configured. Enter your key in Settings (⚙️) or use Offline Brain.',
    });
    return;
  }

  const selectedModel = model || 'gemini-2.0-flash';

  const formattedContents = Array.isArray(messages)
    ? messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }))
    : [];

  if (formattedContents.length === 0) {
    res.status(400).json({ error: 'No messages provided.' });
    return;
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const ai = new GoogleGenAI({
      apiKey: resolvedApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const config: { systemInstruction?: string; temperature?: number } = {};
    if (systemInstruction && typeof systemInstruction === 'string') {
      config.systemInstruction = systemInstruction;
    }
    if (typeof temperature === 'number' && !isNaN(temperature)) {
      config.temperature = Math.max(0, Math.min(2, temperature));
    }

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: formattedContents,
      config,
    });

    clearTimeout(timeoutId);

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error calling Gemini API';
    console.error('Gemini chat streaming error:', errorMessage);
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// Setup Vite dev server or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`❄️ Winter assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
