import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { describeFileHead, detectFileFormat, type FileFormat } from '../../api/_utils/file-signature';

/**
 * Real files, made by real software: Chromium (PDF, PNG, JPG, WEBP),
 * macOS sips (HEIC, from the PNG) and macOS textutil (DOC, DOCX).
 */
const fixture = (name: string) => readFileSync(path.join(__dirname, 'fixtures/uploads', name));

const bytes = (...parts: (string | number[] | Buffer)[]) =>
  Buffer.concat(parts.map((part) => (typeof part === 'string' ? Buffer.from(part, 'latin1') : Buffer.from(part))));

const MZ = [0x4d, 0x5a, 0x90, 0x00];
const OLE2 = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

describe('detectFileFormat', () => {
  it.each<[string, FileFormat]>([
    ['documento.pdf', 'pdf'],
    ['foto.png', 'png'],
    ['foto.jpg', 'jpeg'],
    ['foto.webp', 'webp'],
    ['foto.heic', 'heif'],
    ['carta.doc', 'doc'],
    ['carta.docx', 'docx'],
  ])('recognises the real file %s as %s', (name, format) => {
    expect(detectFileFormat(fixture(name))).toBe(format);
  });

  describe('accepts variants real files have', () => {
    it('a PDF whose header follows other bytes within the first KB, as some scanners write', () => {
      expect(detectFileFormat(bytes('\r\n'.repeat(400), fixture('documento.pdf')))).toBe('pdf');
    });

    it('a HEIF whose major brand is mif1, with heic among the compatible brands', () => {
      expect(detectFileFormat(bytes([0, 0, 0, 0x18], 'ftypmif1', [0, 0, 0, 0], 'mif1heic'))).toBe('heif');
    });

    it('a HEIC sequence (Live Photo style) with major brand hevc', () => {
      expect(detectFileFormat(bytes([0, 0, 0, 0x14], 'ftyphevc', [0, 0, 0, 0], 'hevc'))).toBe('heif');
    });
  });

  describe('rejects', () => {
    it.each<[string, Buffer]>([
      ['an empty file', Buffer.alloc(0)],
      ['plain text', bytes('Hola, esto es una nota.\n')],
      ['an HTML page', bytes('<!doctype html><html><script>alert(1)</script></html>')],
      ['an SVG image (it can carry scripts)', bytes('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')],
      ['an RTF document saved as .doc (a known malware carrier)', bytes('{\\rtf1\\ansi Hola}')],
      ['a GIF', bytes('GIF89a', [1, 0, 1, 0])],
      ['an AVI (RIFF but not WEBP)', bytes('RIFF', [0, 0, 0, 0], 'AVI LIST')],
      ['an MP4 video (ftyp, but not a HEIF brand)', bytes([0, 0, 0, 0x18], 'ftypisom', [0, 0, 0, 0], 'isomiso2')],
      ['a PDF header past the first KB', bytes(' '.repeat(1024), '%PDF-1.4\n')],
      ['an Excel .xls or .msi installer (OLE2 without a WordDocument stream)', bytes(OLE2, Buffer.alloc(512), Buffer.from('Workbook', 'utf16le'))],
      ['an .xlsx (a ZIP without word/)', bytes('PK\x03\x04', Buffer.alloc(26), '[Content_Types].xml', 'xl/workbook.xml')],
      ['a ZIP archive with a program inside', bytes('PK\x03\x04', Buffer.alloc(26), 'setup.exe', MZ)],
    ])('%s', (_case, content) => {
      expect(detectFileFormat(content)).toBeNull();
    });

    it.each<[string, number[]]>([
      ['a Windows program (MZ)', MZ],
      ['a Linux program (ELF)', [0x7f, 0x45, 0x4c, 0x46]],
      ['a macOS program (Mach-O 64-bit)', [0xcf, 0xfa, 0xed, 0xfe]],
      ['a macOS universal binary', [0xca, 0xfe, 0xba, 0xbe]],
      ['a shell script', [0x23, 0x21]],
    ])('%s, even with a PDF header inside its first KB', (_case, signature) => {
      expect(detectFileFormat(bytes(signature, Buffer.alloc(64), '%PDF-1.4\n'))).toBeNull();
      expect(detectFileFormat(bytes(signature, fixture('documento.pdf')))).toBeNull();
    });

    it('a real file cut down to its first byte', () => {
      for (const name of ['foto.png', 'foto.jpg', 'foto.webp', 'foto.heic', 'carta.doc', 'carta.docx']) {
        expect(detectFileFormat(fixture(name).subarray(0, 1)), name).toBeNull();
      }
    });
  });
});

describe('describeFileHead', () => {
  it('shows the first 8 bytes as hex, so a log never carries file contents', () => {
    expect(describeFileHead(fixture('documento.pdf'))).toBe('255044462d312e34');
    expect(describeFileHead(Buffer.from([0x4d, 0x5a]))).toBe('4d5a');
  });
});
