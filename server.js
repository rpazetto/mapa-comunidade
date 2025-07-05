const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

console.log('=== SERVER STARTING ===');
console.log('PORT from env:', process.env.PORT);
console.log('Using port:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('ERROR handling request:', err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    }).listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`=== SERVER READY ===`);
      console.log(`> Listening on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('FATAL: Failed to start Next.js:', err);
    process.exit(1);
  });
