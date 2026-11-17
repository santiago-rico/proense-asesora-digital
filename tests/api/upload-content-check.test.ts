import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach, type MockInstance } from 'vitest';
import type { VercelRequest, VercelResponse } from '../../api/_utils/vercel-types';

// The endpoints import the Brevo client at top level; mock it so importing them
// never needs API keys or network access.
vi.mock('../../src/utils/brevo.js', () => ({
  sendTransactionalEmail: vi.fn(),
}));

/** A file as formidable v3 hands it over, after writing it to a temp path. */
interface UploadedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

// Handler tests skip the multipart parsing and CSRF check: formidable hands
// over `parsed.fields` and `parsed.files`, and every CSRF token verifies.
const parsed = vi.hoisted(() => ({
  fields: {} as Record<string, string[]>,
  files: {} as Record<string, UploadedFile[]>,
}));
vi.mock('formidable', () => ({
  default: () => ({
    parse: (
      _req: unknown,
      cb: (err: null, fields: Record<string, string[]>, files: Record<string, UploadedFile[]>) => void,
    ) => cb(null, parsed.fields, parsed.files),
  }),
}));
vi.mock('csrf', () => ({
  default: class {
    verify() {
      return true;
    }
  },
}));

import sendInsuranceApplication from '../../api/send-insurance-application-email';
import sendCancellationRequest from '../../api/send-cancellation-request';
import sendModificationRequest from '../../api/send-modification-request';
import { _store } from '../../api/_utils/rate-limiter';
import { sendTransactionalEmail } from '../../src/utils/brevo.js';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

const CLIENT_EMAIL = 'maria.gomez@example.com';

const commonFields = {
  nombreCompleto: 'María Gómez',
  numeroCedula: '1234567890',
  telefono: '+573001234567',
  email: CLIENT_EMAIL,
  aceptaTerminosYPolitica: 'true',
  website: '',
};

/**
 * The three endpoints that take uploads, with valid fields (cancelación and
 * modificación check files only after the fields), the field the client sends
 * files under, the prefix of their log lines and their invalid-type message.
 */
const ENDPOINTS: {
  name: string;
  handler: Handler;
  fields: Record<string, string>;
  fileField: string;
  logPrefix: string;
  typeMessage: (fileName: string) => string;
}[] = [
  {
    name: 'emisión',
    handler: sendInsuranceApplication,
    fields: {
      ...commonFields,
      tipoSeguro: 'responsabilidad_civil',
      metodoPago: 'tarjeta_credito',
      periodicidadPago: 'mensual',
      declaraRenta: 'si',
      aceptaDeclaracionAsesoria: 'true',
    },
    fileField: 'fotoCedula',
    logPrefix: '[emision]',
    typeMessage: (fileName) =>
      `El tipo de archivo "${fileName}" no es válido. Solo se aceptan PDF, JPG, PNG, WEBP, HEIC, DOC, DOCX.`,
  },
  {
    name: 'cancelación',
    handler: sendCancellationRequest,
    fields: {
      ...commonFields,
      nombreAseguradora: 'Seguros Ejemplo',
      tipoSeguro: 'auto',
      cancellationReason: 'Vendí el vehículo',
    },
    fileField: 'documentosAdicionales',
    logPrefix: '[cancelacion]',
    typeMessage: (fileName) => `El tipo de archivo de ${fileName} no es válido.`,
  },
  {
    name: 'modificación',
    handler: sendModificationRequest,
    fields: {
      ...commonFields,
      nombreAseguradora: 'Seguros Ejemplo',
      tipoSeguro: 'auto',
      modificaciones: 'Cambiar la placa del vehículo',
    },
    fileField: 'documentosAdicionales',
    logPrefix: '[modificacion]',
    typeMessage: (fileName) => `El tipo de archivo de ${fileName} no es válido.`,
  },
];

// ---------------------------------------------------------------------------
// File contents
// ---------------------------------------------------------------------------

const latin1 = (text: string) => Buffer.from(text, 'latin1');

/** The start of a Windows .exe: the MZ header and the DOS stub's message. */
const WINDOWS_EXE = Buffer.concat([
  latin1('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00'),
  Buffer.alloc(48),
  latin1('This program cannot be run in DOS mode.\r\n$'),
]);
/** An executable with a PDF header inside its first KB, which a PDF reader would also open. */
const EXE_PDF_POLYGLOT = Buffer.concat([WINDOWS_EXE, Buffer.alloc(200), latin1('%PDF-1.4\n%%EOF\n')]);
const HTML_PAGE = Buffer.from('<!DOCTYPE html><html><body><script>alert(1)</script></body></html>\n');
const PDF = latin1('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n');
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  latin1('\x00\x00\x00\x0dIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00'),
]);
/** An iPhone photo's ftyp box: major brand heic, compatible brands mif1 and heic. */
const HEIC = latin1('\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDir: string;
let fileCount = 0;

/** Writes `content` to a temp file, as formidable does, and describes it like formidable. */
function upload(originalFilename: string, mimetype: string, content: Buffer): UploadedFile {
  const filepath = path.join(tempDir, `upload-${++fileCount}`);
  fs.writeFileSync(filepath, content);
  return { filepath, originalFilename, mimetype, size: content.length };
}

function request(fields: Record<string, string>, files: Record<string, UploadedFile[]>): VercelRequest {
  parsed.fields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, [value]]));
  parsed.files = files;
  return {
    method: 'POST',
    headers: { cookie: '_csrf_secret=secret', 'x-csrf-token': 'token', 'x-forwarded-for': '203.0.113.7' },
  } as unknown as VercelRequest;
}

function response() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    setHeader: vi.fn(),
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    end: vi.fn(),
  };
  return res;
}

/** The email sent to the agents (every email not addressed to the client). */
function agentEmail() {
  const toAgents = vi.mocked(sendTransactionalEmail).mock.calls
    .map(([payload]) => payload)
    .filter((payload) => !payload.to.some((recipient) => recipient.email === CLIENT_EMAIL));
  expect(toAgents).toHaveLength(1);
  return toAgents[0];
}

/** The handlers unlink temp files in `finally` with a callback, after answering. */
async function expectDeleted(file: UploadedFile) {
  await vi.waitFor(() => expect(fs.existsSync(file.filepath)).toBe(false));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-check-'));
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe.each(ENDPOINTS)('$name: upload content check', ({ handler, fields, fileField, logPrefix, typeMessage }) => {
  let warn: MockInstance<typeof console.warn>;
  let error: MockInstance<typeof console.error>;
  let log: MockInstance<typeof console.log>;

  beforeEach(() => {
    _store.clear();
    vi.mocked(sendTransactionalEmail).mockReset();
    vi.mocked(sendTransactionalEmail).mockResolvedValue({ success: true });
    // Rejections log a warning and the caught error; emisión logs diagnostics.
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
    log = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function submit(file: UploadedFile, fieldOverrides: Record<string, string> = {}) {
    const res = response();
    await handler(request({ ...fields, ...fieldOverrides }, { [fileField]: [file] }), res as unknown as VercelResponse);
    return res;
  }

  /** Everything the handler logged, as one string. */
  const logged = () => [warn, error, log].flatMap((spy) => spy.mock.calls.flat()).map(String).join('\n');

  it('rejects a Windows executable declared as a PDF with 400, sends no email and deletes the temp file', async () => {
    const file = upload('factura.pdf', 'application/pdf', WINDOWS_EXE);

    const res = await submit(file);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: typeMessage('factura.pdf') });
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
    await expectDeleted(file);
  });

  it('rejects an executable with a PDF header inside its first KB', async () => {
    const file = upload('factura.pdf', 'application/pdf', EXE_PDF_POLYGLOT);

    const res = await submit(file);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: typeMessage('factura.pdf') });
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
    await expectDeleted(file);
  });

  it('rejects an HTML page declared as a JPEG', async () => {
    const file = upload('foto.jpg', 'image/jpeg', HTML_PAGE);

    const res = await submit(file);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: typeMessage('foto.jpg') });
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
    await expectDeleted(file);
  });

  it('emails a real PDF to the agents as a base64 attachment', async () => {
    const file = upload('factura.pdf', 'application/pdf', PDF);

    const res = await submit(file);

    expect(res.statusCode).toBe(200);
    expect(agentEmail().attachment).toEqual([{ name: 'factura.pdf', content: PDF.toString('base64') }]);
    await expectDeleted(file);
  });

  it('accepts a PNG declared as a JPEG: the content only has to be an allowed format', async () => {
    const file = upload('foto.jpg', 'image/jpeg', PNG);

    const res = await submit(file);

    expect(res.statusCode).toBe(200);
    expect(agentEmail().attachment).toEqual([{ name: 'foto.jpg', content: PNG.toString('base64') }]);
    await expectDeleted(file);
  });

  it('accepts an iPhone HEIC photo', async () => {
    const file = upload('IMG_0001.HEIC', 'image/heic', HEIC);

    const res = await submit(file);

    expect(res.statusCode).toBe(200);
    expect(agentEmail().attachment).toEqual([{ name: 'IMG_0001.HEIC', content: HEIC.toString('base64') }]);
    await expectDeleted(file);
  });

  it('logs a rejection with the declared type, size and first bytes, but never the file name', async () => {
    const file = upload('factura-maria-gomez.pdf', 'application/pdf', WINDOWS_EXE);

    await submit(file);

    const line = warn.mock.calls.map(([first]) => String(first)).find((text) => text.includes(`${logPrefix} rejected upload`));
    expect(line).toBeDefined();
    expect(line).toContain('declared=application/pdf');
    expect(line).toContain(`size=${WINDOWS_EXE.length}`);
    expect(line).toContain(`head=${WINDOWS_EXE.subarray(0, 8).toString('hex')}`);
    // The 400 message names the file; no log line may (the name can carry personal data)
    expect(logged()).not.toMatch(/factura|maria/i);
    await expectDeleted(file);
  });

  it('deletes the temp file when the form data is invalid', async () => {
    const file = upload('factura.pdf', 'application/pdf', PDF);

    const res = await submit(file, { email: 'no-es-un-correo' });

    expect(res.statusCode).toBe(400);
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
    await expectDeleted(file);
  });

  it('deletes the temp file when the honeypot catches a bot', async () => {
    const file = upload('factura.pdf', 'application/pdf', PDF);

    const res = await submit(file, { website: 'https://spam.example' });

    expect(res.statusCode).toBe(200);
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
    await expectDeleted(file);
  });
});
