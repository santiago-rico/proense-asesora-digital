/**
 * Types for the request/response objects Vercel's Node.js runtime passes to
 * the functions in api/.
 *
 * They mirror the `VercelRequest`/`VercelResponse` declarations of the
 * `@vercel/node` npm package, which this project used to install only for
 * these two types. That package also ships Vercel's build-time builder, whose
 * pinned dependencies (undici 5, ts-morph 12, ajv 8.6) kept `npm audit` red.
 * Vercel builds and runs api/ with its own copy of the Node.js runtime, so the
 * package does not need to be installed.
 *
 * At runtime the objects are Node's IncomingMessage/ServerResponse plus the
 * helpers listed at
 * https://vercel.com/docs/functions/runtimes/node-js#node.js-helpers
 *
 * Import with `import type` only: this file must never be loaded at runtime.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

export type VercelRequestCookies = { [key: string]: string };
export type VercelRequestQuery = { [key: string]: string | string[] };
/**
 * Parsed from the Content-Type: an object for JSON and urlencoded bodies, a
 * string for text/plain, a Buffer for octet-stream, otherwise `undefined`.
 * Kept as `any`, as in `@vercel/node`, so callers narrow it themselves.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VercelRequestBody = any;

export type VercelRequest = IncomingMessage & {
  query: VercelRequestQuery;
  cookies: VercelRequestCookies;
  body: VercelRequestBody;
};

export type VercelResponse = ServerResponse & {
  send: (body: unknown) => VercelResponse;
  json: (jsonBody: unknown) => VercelResponse;
  status: (statusCode: number) => VercelResponse;
  redirect: (statusOrUrl: string | number, url?: string) => VercelResponse;
};
