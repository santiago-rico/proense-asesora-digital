import { describe, it, expect } from 'vitest';
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_MIME_TYPES,
  MAX_UPLOAD_FILE_SIZE,
  UPLOAD_FILES_ERROR_MESSAGE,
  uploadedFilesSchema,
  asSendableFile,
} from '../fileRules';

const file = (name: string, type: string, size = 16) =>
  new File([Uint8Array.from({ length: size }, (_, i) => i % 251)], name, { type, lastModified: 1_700_000_000_000 });

/** A file's bytes, read the way jsdom supports (its File has no arrayBuffer()). */
const bytesOf = (blob: Blob) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

describe('fileRules', () => {
  describe('asSendableFile', () => {
    /** What file-selector (inside react-dropzone) does to some untyped files: redefine `type`. */
    const typedByDropzone = (name: string, type: string) => {
      const untyped = file(name, '');
      Object.defineProperty(untyped, 'type', { value: type, writable: false, configurable: false, enumerable: true });
      return untyped;
    };

    /** The copy carries its type itself (FormData sends that), not through a redefined property. */
    const expectOwnType = (sendable: File, type: string) => {
      expect(sendable.type).toBe(type);
      expect(Object.getOwnPropertyDescriptor(sendable, 'type')).toBeUndefined();
    };

    it.each([
      ['IMG_0001.HEIC', '', 'image/heic'],
      ['foto.heic', 'application/octet-stream', 'image/heic'],
      ['foto.HEIF', '', 'image/heif'],
      ['scan.JPG', '', 'image/jpeg'],
      ['poliza.pdf', '', 'application/pdf'],
      ['carta.docx', '', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ])('copies the untyped %s (type "%s") as %s, keeping its name, contents and date', async (name, type, expected) => {
      const original = file(name, type, 24);

      const sendable = asSendableFile(original);

      expect(sendable).not.toBe(original);
      expectOwnType(sendable, expected);
      expect(sendable.name).toBe(name);
      expect(sendable.size).toBe(24);
      expect(sendable.lastModified).toBe(original.lastModified);
      expect(await bytesOf(sendable)).toEqual(await bytesOf(original));
    });

    it('gives its own type to a file whose type react-dropzone only redefined', () => {
      const original = typedByDropzone('carta.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(Object.getOwnPropertyDescriptor(original, 'type')).toBeDefined();

      expectOwnType(asSendableFile(original), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it.each([
      ['a file the browser typed', 'foto.heic', 'image/heic', 'image/heic'],
      ['a typed file whose extension disagrees', 'foto.png', 'image/jpeg', 'image/jpeg'],
      ['an untyped file with an extension we reject', 'notas.txt', '', ''],
      ['an untyped file without an extension', 'README', '', ''],
      ['an untyped file whose name ends in a dot', 'foto.', '', ''],
    ])('keeps the type of %s', (_case, name, type, expected) => {
      expectOwnType(asSendableFile(file(name, type)), expected);
    });
  });

  describe('uploadedFilesSchema', () => {
    it('accepts every listed type, HEIC and HEIF included', () => {
      expect(ACCEPTED_MIME_TYPES).toEqual(expect.arrayContaining(['image/heic', 'image/heif']));
      const files = Object.entries(ACCEPTED_FILE_TYPES).map(([type, [extension]]) => file(`archivo${extension}`, type));

      expect(uploadedFilesSchema.safeParse(files).success).toBe(true);
    });

    it('accepts no files, an empty list and a file of exactly 5 MB', () => {
      expect(uploadedFilesSchema.safeParse(undefined).success).toBe(true);
      expect(uploadedFilesSchema.safeParse([]).success).toBe(true);
      expect(uploadedFilesSchema.safeParse([file('a.pdf', 'application/pdf', MAX_UPLOAD_FILE_SIZE)]).success).toBe(true);
    });

    it.each([
      ['an untyped file', file('IMG_0001.HEIC', '')],
      ['an executable', file('setup.exe', 'application/x-msdownload')],
      ['a text file', file('notas.txt', 'text/plain')],
      ['a file over 5 MB', file('grande.pdf', 'application/pdf', MAX_UPLOAD_FILE_SIZE + 1)],
    ])('rejects %s with one message listing HEIC', (_case, bad) => {
      const result = uploadedFilesSchema.safeParse([file('ok.pdf', 'application/pdf'), bad]);

      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.message)).toEqual([UPLOAD_FILES_ERROR_MESSAGE]);
      expect(UPLOAD_FILES_ERROR_MESSAGE).toContain('HEIC');
    });

    it('rejects values that are not files', () => {
      expect(uploadedFilesSchema.safeParse(['poliza.pdf']).success).toBe(false);
      expect(uploadedFilesSchema.safeParse('poliza.pdf').success).toBe(false);
    });
  });
});
