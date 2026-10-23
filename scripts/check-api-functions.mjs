#!/usr/bin/env node

/**
 * Checks that every Vercel function in api/ deploys, loads and answers the way
 * it will in production. Run with `npm run check:api`; CI runs it on each PR.
 *
 * Unit tests import the TypeScript sources through Vite, and plain Node 22.12+
 * can require() an ES module, but Vercel's launcher cannot. jsdom 30 (#189)
 * crashed every form endpoint in production on load (ERR_REQUIRE_ESM) while
 * the tests, the build and a local run all passed. So this script:
 *
 * 1. Finds the functions the way Vercel does: every file under api/ whose name
 *    or folder does not start with "_", and fails above the Hobby plan's limit.
 * 2. Compiles api/ with the compilerOptions of the root tsconfig.json, which is
 *    what Vercel compiles it with, into node_modules/.cache/.
 * 3. Starts each function in its own `node --no-experimental-require-module`
 *    behind an HTTP server that adds Vercel's request/response helpers, and
 *    sends it requests that stop before any email is sent: without a CSRF
 *    token (403) and with a valid token but an empty form (400).
 *
 * Outgoing requests are blocked, so a function that got past validation would
 * fail the check instead of reaching Brevo.
 */

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'node_modules/.cache/api-functions-check');

/** Vercel's Hobby plan fails any deployment with more functions than this. */
const MAX_FUNCTIONS = 12;

/**
 * What each function is sent. A new file in api/ fails the check until it is
 * listed here, so every deployed function gets exercised.
 */
const FUNCTIONS = {
  'csrf-token': { kind: 'csrf-token' },
  'send-email': { kind: 'form', body: 'json' },
  'send-quote-request': { kind: 'form', body: 'json' },
  'send-insurance-application-email': { kind: 'form', body: 'multipart' },
  'send-modification-request': { kind: 'form', body: 'multipart' },
  'send-cancellation-request': { kind: 'form', body: 'multipart' },
};

const CHILD_FLAG = '--child';

if (process.argv[2] === CHILD_FLAG) {
  await runChild(process.argv[3], process.argv[4]);
} else {
  await main();
}

// ---------------------------------------------------------------------------
// Parent: find, compile and run each function in its own process.
// ---------------------------------------------------------------------------

async function main() {
  const functions = findFunctions(path.join(ROOT, 'api'));
  const failed = [];

  const tooMany = functions.length > MAX_FUNCTIONS;
  console.log(`${tooMany ? '✗' : '✓'} ${functions.length} functions in api/ (Hobby plan limit: ${MAX_FUNCTIONS})`);
  if (tooMany) {
    console.log('    ✗ Vercel will refuse to deploy: move helpers to api/_utils/ and tests to tests/api/');
    failed.push('the function count');
  }

  await compile(functions);

  for (const file of functions) {
    const name = path.relative(path.join(ROOT, 'api'), file).replace(/\.[^.]+$/, '');
    const spec = FUNCTIONS[name];
    if (!spec) {
      console.log(`✗ api/${name}\n    ✗ not listed in FUNCTIONS in scripts/check-api-functions.mjs`);
      failed.push(`api/${name}`);
      continue;
    }

    const compiled = path.join(OUT, path.relative(ROOT, file)).replace(/\.[^.]+$/, '.js');
    const result = spawnSync(
      process.execPath,
      ['--no-experimental-require-module', fileURLToPath(import.meta.url), CHILD_FLAG, compiled, spec.kind === 'form' ? `form:${spec.body}` : spec.kind],
      { cwd: ROOT, encoding: 'utf8', timeout: 60_000, env: childEnv() },
    );
    const report = parseReport(result);
    const ok = report.errors.length === 0;
    console.log(`${ok ? '✓' : '✗'} api/${name}`);
    for (const line of report.lines) console.log(`    ${line}`);
    if (!ok) {
      for (const error of report.errors) console.log(`    ✗ ${error}`);
      if (result.stderr.trim()) console.log(indent(`stderr:\n${result.stderr.trim()}`, 6));
      failed.push(`api/${name}`);
    }
  }

  if (failed.length > 0) {
    console.error(`\nFailed: ${failed.join(', ')}. Details above.`);
    process.exit(1);
  }
  console.log('\nAll functions load without require(esm) and answer as expected.');
}

/** Files Vercel turns into functions: everything under api/ outside "_" names. */
function findFunctions(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('_') && !entry.name.startsWith('.'))
    .flatMap(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return findFunctions(full);
      return /\.(?:[cm]?[jt]s|[jt]sx)$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [full] : [];
    })
    .sort();
}

/**
 * Emits JavaScript for the functions and the files they import. Type errors are
 * ignored here: `npm run typecheck` reports them.
 */
async function compile(functions) {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  // Resolve module format like the deployed files, which sit next to the root package.json.
  const { type = 'commonjs' } = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  writeFileSync(path.join(OUT, 'package.json'), JSON.stringify({ type }));

  const { default: ts } = await import('typescript');
  const { config } = ts.readConfigFile(path.join(ROOT, 'tsconfig.json'), ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, ROOT);
  const program = ts.createProgram(functions, {
    ...options,
    rootDir: ROOT,
    outDir: OUT,
    noEmit: false,
    noEmitOnError: false,
    declaration: false,
    composite: false,
    incremental: false,
    sourceMap: false,
  });
  const { emitSkipped } = program.emit();
  if (emitSkipped) throw new Error('TypeScript emitted nothing for api/');
}

/** Production mode, and no email credentials even if the shell has some. */
function childEnv() {
  const env = { ...process.env, NODE_ENV: 'production' };
  for (const key of Object.keys(env)) {
    if (key.startsWith('BREVO_') || key.startsWith('NOTIFY_') || key === 'NOTIFICATION_EMAILS') delete env[key];
  }
  return env;
}

function parseReport(result) {
  const last = result.stdout.trim().split('\n').pop() ?? '';
  try {
    const report = JSON.parse(last);
    if (Array.isArray(report.lines) && Array.isArray(report.errors)) return report;
  } catch {
    // Fall through: the child crashed or timed out before reporting.
  }
  const reason = result.error?.code === 'ETIMEDOUT' ? 'timed out after 60 s' : `exited with code ${result.status} before reporting`;
  return { lines: [], errors: [`the check process ${reason}`] };
}

function indent(text, spaces) {
  return text.replace(/^/gm, ' '.repeat(spaces));
}

// ---------------------------------------------------------------------------
// Child: load one compiled function and send it requests.
// ---------------------------------------------------------------------------

async function runChild(compiledFile, kind) {
  const lines = [];
  const errors = [];
  const report = () => {
    console.log(JSON.stringify({ lines, errors }));
    // The rate limiter keeps a cleanup interval alive.
    process.exit(0);
  };

  const realFetch = globalThis.fetch;
  const outgoing = [];
  globalThis.fetch = async input => {
    const url = typeof input === 'string' ? input : input.url ?? String(input);
    outgoing.push(url);
    throw new Error(`Outgoing request blocked by the API check: ${url}`);
  };

  let handler;
  try {
    ({ default: handler } = await import(pathToFileURL(compiledFile).href));
  } catch (error) {
    errors.push(`fails to load: ${error.code ? `${error.code} ` : ''}${error.message.split('\n')[0]}`);
    return report();
  }
  if (typeof handler !== 'function') {
    errors.push('has no default export function');
    return report();
  }
  lines.push('loads without require(esm)');

  const thrown = [];
  const server = createServer(async (req, res) => {
    try {
      await addVercelHelpers(req, res);
      await handler(req, res);
    } catch (error) {
      // Vercel answers 500 FUNCTION_INVOCATION_FAILED.
      thrown.push(error);
      if (!res.headersSent) res.writeHead(500).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = async (method, init = {}) => {
    const response = await realFetch(`${base}/api/check`, {
      method,
      ...init,
      headers: { origin: 'https://www.proense.co', 'x-forwarded-for': '203.0.113.7', ...init.headers },
    });
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
    return { status: response.status, json, text, headers: response.headers };
  };
  const expectStatus = (label, response, status, extra = () => true) => {
    const ok = response.status === status && extra(response);
    const detail = `${response.status} ${(response.text || '').slice(0, 120)}`;
    if (ok) lines.push(`${label} → ${detail}`);
    else errors.push(`${label}: expected ${status}, got ${detail}`);
  };

  try {
    if (kind === 'csrf-token') {
      const response = await send('GET');
      expectStatus(
        'GET',
        response,
        200,
        r => typeof r.json?.token === 'string' && (r.headers.get('set-cookie') ?? '').includes('_csrf_secret='),
      );
    } else {
      const [, body] = kind.split(':');
      const { default: Tokens } = await import('csrf');
      const tokens = new Tokens();
      const secret = tokens.secretSync();
      const emptyForm = () =>
        body === 'json'
          ? { body: '{}', headers: { 'content-type': 'application/json' } }
          : { body: new FormData() };

      const withoutToken = await send('POST', emptyForm());
      expectStatus('POST without a CSRF token', withoutToken, 403, r => r.json?.code === 'CSRF_INVALID');

      const form = emptyForm();
      const withToken = await send('POST', {
        ...form,
        headers: { ...form.headers, cookie: `_csrf_secret=${secret}`, 'x-csrf-token': tokens.create(secret) },
      });
      expectStatus('POST an empty form with a valid token', withToken, 400);
    }
  } catch (error) {
    errors.push(`request failed: ${error.message}`);
  }

  const stacks = thrown.map(error => error.stack?.split('\n').slice(0, 3).join(' | ') ?? String(error));
  for (const stack of new Set(stacks)) errors.push(`threw: ${stack}`);
  for (const url of new Set(outgoing)) errors.push(`tried to reach ${url}`);
  server.close();
  report();
}

/**
 * The helpers Vercel's Node.js runtime adds to each request and response:
 * https://vercel.com/docs/functions/runtimes/node-js#node.js-helpers
 * The body is only read for the content types Vercel parses, so functions that
 * parse multipart themselves (formidable) still get an unread stream.
 */
async function addVercelHelpers(req, res) {
  const url = new URL(req.url, 'http://localhost');
  req.query = Object.fromEntries(url.searchParams);
  req.cookies = Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(';')
      .map(pair => pair.trim().split('='))
      .filter(([key]) => key)
      .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))]),
  );

  const type = (req.headers['content-type'] ?? '').split(';')[0].trim();
  if (['application/json', 'application/x-www-form-urlencoded', 'text/plain', 'application/octet-stream'].includes(type)) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks);
    if (type === 'application/json') req.body = raw.length ? JSON.parse(raw.toString('utf8')) : undefined;
    else if (type === 'application/x-www-form-urlencoded') req.body = Object.fromEntries(new URLSearchParams(raw.toString('utf8')));
    else if (type === 'text/plain') req.body = raw.toString('utf8');
    else req.body = raw;
  } else {
    req.body = undefined;
  }

  res.status = code => {
    res.statusCode = code;
    return res;
  };
  res.send = body => {
    if (body !== null && typeof body === 'object' && !Buffer.isBuffer(body)) return res.json(body);
    if (!res.getHeader('content-type')) res.setHeader('content-type', Buffer.isBuffer(body) ? 'application/octet-stream' : 'text/html; charset=utf-8');
    res.end(body);
    return res;
  };
  res.json = body => {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
    return res;
  };
  res.redirect = (statusOrUrl, url) => {
    res.writeHead(typeof statusOrUrl === 'number' ? statusOrUrl : 307, { location: url ?? statusOrUrl }).end();
    return res;
  };
}
