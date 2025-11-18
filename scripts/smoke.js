/*
  Simple smoke-test script for local Next.js dev server.
  Usage: node ./scripts/smoke.js [url] [timeoutSeconds]
  Example: node ./scripts/smoke.js http://localhost:3000 30
*/

const url = process.argv[2] || process.env.SMOKE_URL || 'http://localhost:3000';
const timeoutSeconds = parseInt(process.argv[3] || process.env.SMOKE_TIMEOUT || '30', 10);
const intervalMs = 1000;

console.log(`Smoke test: polling ${url} for up to ${timeoutSeconds}s`);

const start = Date.now();

async function check() {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 200) {
      console.log(`SUCCESS: ${url} responded 200 OK`);
      process.exit(0);
    } else {
      console.log(`STATUS ${res.status} - retrying...`);
    }
  } catch (err) {
    console.log(`ERROR: ${err.message || err} - retrying...`);
  }

  if ((Date.now() - start) / 1000 > timeoutSeconds) {
    console.error(`FAILED: ${url} did not respond with 200 within ${timeoutSeconds}s`);
    process.exit(2);
  }

  setTimeout(check, intervalMs);
}

check();
