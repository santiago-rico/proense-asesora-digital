/**
 * Recognises an uploaded file's format from its bytes ("magic numbers").
 *
 * The type the upload endpoints check otherwise is the Content-Type the
 * client declares, which anyone posting to the API directly can set to
 * anything. This checks what the file actually is, so a program renamed
 * `factura.pdf` and labelled application/pdf is not emailed to the agents.
 *
 * Only the allowed formats are recognised (PDF, JPG, PNG, WEBP, HEIC/HEIF,
 * DOC, DOCX). The format doesn't have to match the declared type: a real PNG
 * saved as .jpg is still an image. It recognises the container, not whether
 * the content is harmless: a well-formed PDF with scripts or a .doc with
 * macros still passes.
 *
 * Hand-written on purpose: the usual library (file-type) is ESM-only, and
 * Vercel's runtime can't require() ES modules.
 */

export type FileFormat = 'pdf' | 'jpeg' | 'png' | 'webp' | 'heif' | 'doc' | 'docx';

/** A PDF's `%PDF-` may follow up to 1 KB of other bytes (some scanners add them). */
const PDF_HEADER_WINDOW = 1024;

/** ISO base media brands of HEIC/HEIF images (iPhone photos use heic + mif1). */
const HEIF_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs', 'mif1', 'mif2', 'msf1']);

const OLE2_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
/** Every Word 97–2003 file has this stream; .msi installers and .xls files, also OLE2, don't. */
const WORD_DOCUMENT_STREAM = Buffer.from('WordDocument', 'utf16le');

/** Programs and scripts, rejected even if a PDF header follows within the first KB. */
const EXECUTABLE_SIGNATURES = [
  [0x4d, 0x5a], // MZ: Windows .exe, .dll, .scr
  [0x7f, 0x45, 0x4c, 0x46], // ELF: Linux
  [0xfe, 0xed, 0xfa, 0xce], [0xfe, 0xed, 0xfa, 0xcf], // Mach-O: macOS
  [0xce, 0xfa, 0xed, 0xfe], [0xcf, 0xfa, 0xed, 0xfe],
  [0xca, 0xfe, 0xba, 0xbe], // Mach-O universal binary (also Java .class)
  [0x23, 0x21], // #!: shell scripts
];

function startsWith(bytes: Buffer, signature: number[] | string, offset = 0): boolean {
  const expected = typeof signature === 'string' ? Buffer.from(signature, 'latin1') : Buffer.from(signature);
  return bytes.length >= offset + expected.length && bytes.subarray(offset, offset + expected.length).equals(expected);
}

function isHeif(bytes: Buffer): boolean {
  if (bytes.length < 16 || !startsWith(bytes, 'ftyp', 4)) return false;
  // ftyp box: size, 'ftyp', major brand, minor version, compatible brands up to the box's end
  const boxEnd = Math.min(bytes.readUInt32BE(0), bytes.length, 256);
  const brands = [bytes.toString('latin1', 8, 12)];
  for (let offset = 16; offset + 4 <= boxEnd; offset += 4) {
    brands.push(bytes.toString('latin1', offset, offset + 4));
  }
  return brands.some((brand) => HEIF_BRANDS.has(brand));
}

/** The allowed format `bytes` are, or null when they're none of them. */
export function detectFileFormat(bytes: Buffer): FileFormat | null {
  if (EXECUTABLE_SIGNATURES.some((signature) => startsWith(bytes, signature))) return null;

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(bytes, 'RIFF') && startsWith(bytes, 'WEBP', 8)) return 'webp';
  if (isHeif(bytes)) return 'heif';
  if (bytes.subarray(0, PDF_HEADER_WINDOW).includes('%PDF-', 0, 'latin1')) return 'pdf';
  if (startsWith(bytes, OLE2_SIGNATURE) && bytes.includes(WORD_DOCUMENT_STREAM)) return 'doc';
  // A .docx is a ZIP; the part names are stored as plain text in its headers
  if (startsWith(bytes, 'PK\x03\x04') && bytes.includes('[Content_Types].xml', 0, 'latin1') && bytes.includes('word/', 0, 'latin1')) {
    return 'docx';
  }
  return null;
}

/** The first bytes as hex, for logs: enough to diagnose a rejection, no personal data. */
export function describeFileHead(bytes: Buffer): string {
  return bytes.subarray(0, 8).toString('hex');
}
