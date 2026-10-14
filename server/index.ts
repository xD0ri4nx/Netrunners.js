import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import type { ClientToServerMessage, ServerToClientMessage } from '../src/shared/multiplayerTypes.ts';
import { sessionManager } from './sessionManager.ts';

const PORT = Number(process.env.PORT) || 8080;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// HTTP Server
const server = http.createServer((req, res) => {
  const url = req.url || '/';

  // GET /health
  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        activeSessions: sessionManager.getActiveSessionCount(),
      })
    );
    return;
  }

  // Serve static files from dist/
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw: Buffer) => {
    try {
      const msg: ClientToServerMessage = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'CREATE_SESSION': {
          const session = sessionManager.createSession(
            msg.payload.targetLocation,
            msg.payload.role,
            msg.payload.hardware,
            msg.payload.iconTier,
            msg.payload.activeUtilities,
            ws
          );
          const response: ServerToClientMessage = {
            type: 'SESSION_CREATED',
            payload: {
              sessionId: session.state.sessionId,
              state: session.state,
              penalties: session.penalties,
            },
          };
          ws.send(JSON.stringify(response));
          break;
        }

        case 'JOIN_SESSION': {
          const session = sessionManager.joinSession(msg.payload.sessionId, msg.payload.role, ws);
          if (session) {
            const response: ServerToClientMessage = {
              type: 'SESSION_CREATED',
              payload: {
                sessionId: session.state.sessionId,
                state: session.state,
                penalties: session.penalties,
              },
            };
            ws.send(JSON.stringify(response));
          } else {
            const response: ServerToClientMessage = {
              type: 'ERROR',
              payload: { code: 'NOT_FOUND', message: 'SESSION NOT FOUND' },
            };
            ws.send(JSON.stringify(response));
          }
          break;
        }

        case 'REQUEST_MOVE': {
          const result = sessionManager.validateAndApplyMove(
            msg.payload.sessionId,
            msg.payload.role,
            msg.payload.x,
            msg.payload.y,
            msg.payload.hardwareSnapshot
          );
          if (!result.success) {
            const response: ServerToClientMessage = {
              type: 'ERROR',
              payload: {
                code: result.code || 'MOVE_FAILED',
                message: result.message || 'MOVE COULD NOT BE COMPLETED',
              },
            };
            ws.send(JSON.stringify(response));
          }
          break;
        }

        case 'DEPLOY_DAEMON': {
          const result = sessionManager.deployDaemon(msg.payload.sessionId, msg.payload.daemon);
          if (!result.success) {
            const response: ServerToClientMessage = {
              type: 'ERROR',
              payload: {
                code: result.code || 'DEPLOY_FAILED',
                message: result.message || 'FAILED TO DEPLOY DAEMON',
              },
            };
            ws.send(JSON.stringify(response));
          }
          break;
        }

        case 'JACK_OUT': {
          sessionManager.handleJackOut(msg.payload.sessionId, msg.payload.role);
          break;
        }

        case 'PING_CHECK': {
          const response: ServerToClientMessage = {
            type: 'PONG_CHECK',
            payload: {
              clientTimestamp: msg.payload.clientTimestamp,
              serverTimestamp: Date.now(),
            },
          };
          ws.send(JSON.stringify(response));
          break;
        }
      }
    } catch (err) {
      console.error('[Server] Failed to handle message', err);
      const errorMsg: ServerToClientMessage = {
        type: 'ERROR',
        payload: { code: 'MALFORMED_MESSAGE', message: 'INVALID JSON PROTOCOL MESSAGE' },
      };
      ws.send(JSON.stringify(errorMsg));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[GridRunner 20XX] Server listening on port ${PORT}`);
});
