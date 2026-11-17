/** Test data for the emisión form e2e suite. Files are built in memory — nothing touches disk. */

import type { Locator } from '@playwright/test';

export interface UploadFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

export const applicant = {
  nombreCompleto: 'María Fernanda Gómez',
  /** Typed into the phone field with Colombia preselected. */
  telefono: '3001234567',
  telefonoE164: '+573001234567',
  email: 'maria.gomez@example.com',
  numeroCedula: '1020304050',
};

/** The company behind a Seguro Empresarial application. */
export const company = {
  numeroCedulaRepLegal: '79876543',
  nit: '900123456',
};

/** A minimal but well-formed PDF, padded to roughly `sizeBytes`. */
export function pdfFile(name = 'documento.pdf', sizeBytes = 2048): UploadFile {
  const header = '%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n';
  const trailer = '\n%%EOF\n';
  const padding = Math.max(0, sizeBytes - header.length - trailer.length);
  return {
    name,
    mimeType: 'application/pdf',
    buffer: Buffer.concat([Buffer.from(header), Buffer.alloc(padding, 0x20), Buffer.from(trailer)]),
  };
}

/** 1×1 PNG — small enough that the form never tries to compress it. */
export function pngFile(name = 'foto.png'): UploadFile {
  return {
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    ),
  };
}

export function textFile(name = 'notas.txt'): UploadFile {
  return { name, mimeType: 'text/plain', buffer: Buffer.from('no permitido') };
}

/**
 * An iPhone photo: only the HEIC `ftyp` box, which is all a mocked server needs
 * (Chromium can't decode HEIC, so the form never converts it to JPEG anyway).
 * `mimeType: ''` is a file the browser couldn't type, as Chrome on Windows
 * reports HEIC; `setInputFiles` below uploads it without a type.
 */
export function heicFile(name = 'IMG_0001.HEIC', mimeType = 'image/heic'): UploadFile {
  const ftyp = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x18]), // box size: 24 bytes
    Buffer.from('ftypheic'), // box type, major brand
    Buffer.alloc(4), // minor version
    Buffer.from('mif1heic'), // compatible brands
  ]);
  return { name, mimeType, buffer: ftyp };
}

/**
 * Sets `files` on an `<input type=file>` like `locator.setInputFiles`, but keeps
 * an empty `mimeType`: Playwright replaces '' with the type of the file's
 * extension. A typeless file is therefore built in the page, the way
 * Playwright's own injected script does it, with the same input/change events.
 */
export async function setInputFiles(input: Locator, files: UploadFile[]): Promise<void> {
  if (files.every(file => file.mimeType)) {
    await input.setInputFiles(files);
    return;
  }
  const payloads = files.map(({ name, mimeType, buffer }) => ({ name, mimeType, base64: buffer.toString('base64') }));
  await input.evaluate((element: HTMLInputElement, payloads) => {
    const dataTransfer = new DataTransfer();
    for (const { name, mimeType, base64 } of payloads) {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      dataTransfer.items.add(new File([bytes], name, { type: mimeType }));
    }
    element.files = dataTransfer.files;
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, payloads);
}

export const MB = 1024 * 1024;
