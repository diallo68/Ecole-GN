// Logger minimal structuré (JSON), inspiré du pattern utilisé sur YouGouYouGou.
function createLogger(module) {
  const log = (level, message, extra = {}) => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), level, module, message, ...extra }));
  };
  return {
    info: (message, extra) => log('INFO', message, extra),
    warn: (message, extra) => log('WARN', message, extra),
    error: (message, extra) => log('ERROR', message, extra),
  };
}

function httpLogger(req, res, next) {
  const log = createLogger('HTTP');
  const start = Date.now();
  res.on('finish', () => {
    log.info(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
    });
  });
  next();
}

module.exports = { createLogger, httpLogger };
