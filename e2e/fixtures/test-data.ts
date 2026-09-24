/** Test data for the emisión form e2e suite. Files are built in memory — nothing touches disk. */

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

export const MB = 1024 * 1024;
