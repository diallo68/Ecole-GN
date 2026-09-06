const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const config = require('./src/config');
const connectDB = require('./src/config/db');
const { httpLogger, createLogger } = require('./src/middlewares/logger');
const routes = require('./src/routes');

const log = createLogger('SERVER');

const app = express();
app.use(cors({ origin: config.CORS_WHITELIST, credentials: true }));
app.use(express.json());
app.use(httpLogger);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gandal-backend' }));
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

const server = http.createServer(app);

// Socket.io pour la messagerie temps réel (à brancher côté controllers plus tard)
const io = new Server(server, { cors: { origin: config.CORS_WHITELIST } });
io.on('connection', (socket) => {
  log.info('Client socket connecté', { id: socket.id });
});

connectDB().then(() => {
  server.listen(config.PORT, () => log.info(`Serveur démarré sur le port ${config.PORT}`));
});

module.exports = { app, server, io };
