import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import path from 'node:path';

/**
 * Vercel's Node.js launcher cannot require() an ES module, although plain Node
 * 22.12+ can. jsdom 30 (#189) broke every form endpoint in production that way
 * (its html-encoding-sniffer requires the ESM-only @exodus/bytes, so each
 * function crashed on load with ERR_REQUIRE_ESM) while tests, the build and a
 * local run all passed. This loads every package the api/ functions import at
 * runtime, including through the src/ helpers they share, with require(esm)
 * turned off as on Vercel.
 */

const ROOT = path.resolve(__dirname, '../..');
const BUILTINS = new Set(builtinModules);

/** Value imports only (`import type` is erased and never loaded), static or dynamic. */
const STATIC_IMPORT = /^\s*import\s+(?!type\s)(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/gm;
const DYNAMIC_IMPORT = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

function listApiFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listApiFiles(full);
    return entry.name.endsWith('.ts') ? [full] : [];
  });
}

/** Bare specifiers imported by `files` and, recursively, by the local files they import. */
function runtimePackages(files: string[]): string[] {
  const seen = new Set<string>();
  const packages = new Set<string>();
  const queue = [...files];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const [, specifier] of [...source.matchAll(STATIC_IMPORT), ...source.matchAll(DYNAMIC_IMPORT)]) {
      if (specifier.startsWith('.')) {
        // api/ imports TS sources by their compiled .js name.
        const base = path.resolve(path.dirname(file), specifier).replace(/\.js$/, '');
        const local = ['.ts', '.tsx'].map(ext => base + ext).find(existsSync);
        if (local) queue.push(local);
      } else if (!specifier.startsWith('node:') && !BUILTINS.has(specifier)) {
        packages.add(specifier);
      }
    }
  }
  return [...packages].sort();
}

describe('api/ runtime packages', () => {
  const packages = runtimePackages(listApiFiles(path.join(ROOT, 'api')));

  it('finds the packages the functions load', () => {
    expect(packages).toEqual(expect.arrayContaining(['jsdom', 'dompurify', 'zod']));
  });

  it('are production dependencies, not devDependencies', () => {
    // Vercel happens to install devDependencies before building, so a runtime
    // package listed there still deploys today; any production-only install
    // (`npm ci --omit=dev`, a changed Vercel default) would ship without it.
    const { dependencies = {} } = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const packageName = (specifier: string) =>
      specifier.split('/').slice(0, specifier.startsWith('@') ? 2 : 1).join('/');
    expect(packages.map(packageName).filter(name => !(name in dependencies))).toEqual([]);
  });

  it('load without require(esm), as on Vercel', () => {
    const script = `
      const failures = [];
      for (const name of ${JSON.stringify(packages)}) {
        try { await import(name); } catch (error) { failures.push(name + ': ' + (error.code ?? '') + ' ' + error.message.split('\\n')[0]); }
      }
      console.log(JSON.stringify(failures));
      process.exit(0);
    `;
    const output = execFileSync(
      process.execPath,
      ['--no-experimental-require-module', '--input-type=module', '-e', script],
      { cwd: ROOT, encoding: 'utf8' },
    );
    const failures: string[] = JSON.parse(output.trim().split('\n').pop()!);
    expect(failures).toEqual([]);
  }, 60_000);
});
