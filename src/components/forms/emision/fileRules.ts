import { z } from 'zod';

/*
 * Upload rules shared by FileUpload and the emisión, cancelación and
 * modificación forms. The api/ endpoints check the same types in their own
 * ALLOWED_MIME_TYPES lists; keep them in sync.
 */

export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file

/** Accepted MIME types and their extensions, in react-dropzone's `accept` format. */
export const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_FILE_TYPES);

/** The accepted formats as users read them. */
export const ACCEPTED_FORMATS_LABEL = 'PDF, JPG, PNG, WEBP, HEIC, DOC, DOCX';

export const UPLOAD_FILES_ERROR_MESSAGE = `Verifica los archivos: solo se aceptan ${ACCEPTED_FORMATS_LABEL} (máx. 5MB).`;

const MIME_TYPE_BY_EXTENSION = new Map(
  Object.entries(ACCEPTED_FILE_TYPES).flatMap(([mimeType, extensions]) =>
    extensions.map((extension) => [extension, mimeType] as const)
  )
);

/**
 * Returns a copy of a picked file that FormData sends with its real type.
 *
 * FormData sends a file with the type it was created with. Redefining its
 * `type` property afterwards doesn't change that. A browser that doesn't know
 * a format creates the file without a type: HEIC photos in Chrome on Windows,
 * or a .docx on a PC without Office. react-dropzone then redefines `type` from
 * the extension for some formats (not HEIC). Either way, FormData would send
 * application/octet-stream and the server would reject the file.
 *
 * So every file is copied into a new File created with its type: the declared
 * one, or else the one its extension maps to. The copy shares the original's
 * data, so it costs nothing. A file whose extension isn't accepted keeps an
 * empty type and still fails validation.
 */
export function asSendableFile(file: File): File {
  const declaredType = file.type === 'application/octet-stream' ? '' : file.type;
  const dot = file.name.lastIndexOf('.');
  const extensionType = dot === -1 ? undefined : MIME_TYPE_BY_EXTENSION.get(file.name.slice(dot).toLowerCase());

  return new File([file], file.name, { type: declaredType || extensionType || '', lastModified: file.lastModified });
}

/** An upload field's value: every file must be an accepted type and at most 5 MB. */
export const uploadedFilesSchema = z
  .array(z.instanceof(File))
  .optional()
  .superRefine((files, ctx) => {
    if (files?.some((file) => file.size > MAX_UPLOAD_FILE_SIZE || !ACCEPTED_MIME_TYPES.includes(file.type))) {
      ctx.addIssue({ code: 'custom', message: UPLOAD_FILES_ERROR_MESSAGE });
    }
  });
