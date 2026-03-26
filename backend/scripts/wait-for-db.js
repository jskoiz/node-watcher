const net = require('node:net');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://brdg_user:brdg_password@localhost:5433/brdg_db';

const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS || 30000);
const intervalMs = Number(process.env.DB_WAIT_INTERVAL_MS || 1000);

function parseDatabaseTarget(connectionUrl) {
  const parsed = new URL(connectionUrl);
  return {
    host: parsed.hostname || '127.0.0.1',
    port: Number(parsed.port || 5432),
  };
}

function canConnect({ host, port }) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });

    const finish = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(intervalMs);
    socket.once('connect', () => finish({ ok: true, error: '' }));
    socket.once('timeout', () =>
      finish({ ok: false, error: `Timed out connecting to ${host}:${port}` }),
    );
    socket.once('error', (error) =>
      finish({ ok: false, error: error.message || String(error) }),
    );
  });
}

async function main() {
  const start = Date.now();
  const target = parseDatabaseTarget(connectionString);
  let lastFailure = '';

  while (Date.now() - start < timeoutMs) {
    const result = await canConnect(target);
    if (result.ok) {
      console.log(`Database is ready on ${target.host}:${target.port}.`);
      return;
    }

    lastFailure = result.error || lastFailure;
    process.stdout.write('.');
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  console.error(`\nDatabase not reachable after ${timeoutMs}ms`);
  if (lastFailure) {
    console.error(`Last connection error: ${lastFailure}`);
  }
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
