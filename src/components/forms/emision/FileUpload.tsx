import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, X, Loader2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const COMPRESSED_TARGET_SIZE = 1 * 1024 * 1024; // 1 MB target for compressed images
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/**
 * Compress an image file using Canvas API.
 * Resizes large images and reduces JPEG quality to stay under target size.
 * Returns the original file if it's not an image or already small enough.
 */
async function compressImage(file: File, targetSize: number = COMPRESSED_TARGET_SIZE): Promise<File> {
  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return file;
  }

  // If already under target, skip compression
  if (file.size <= targetSize) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if the image is very large (e.g., 4000x3000 from phone cameras)
      const MAX_DIMENSION = 2048;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with quality reduction
      const quality = 0.7;
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Compression didn't help, return original
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: file.lastModified,
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original on error
    };

    img.src = url;
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileUploadProps {
  name: string;
  label: string;
  description?: string;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ name, label, description, multiple = false }) => {
  const { setValue, getValues, formState: { errors }, clearErrors } = useFormContext();
  const [myFiles, setMyFiles] = useState<File[]>(getValues(name) || []);
  const [fileDropError, setFileDropError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const onDropAccepted = useCallback(async (acceptedFiles: File[]) => {
    setFileDropError(null);
    clearErrors(name);
    setIsCompressing(true);

    try {
      // Compress images before storing
      const processedFiles = await Promise.all(
        acceptedFiles.map((file) => compressImage(file))
      );

      const currentFiles = getValues(name) || [];
      const newFiles = multiple ? [...currentFiles, ...processedFiles] : processedFiles;
      setMyFiles(newFiles);
      setValue(name, newFiles, { shouldValidate: true });
    } finally {
      setIsCompressing(false);
    }
  }, [multiple, name, setValue, getValues, clearErrors]);

  const onDropRejected = useCallback((fileRejections: { file: File; errors: Array<{ code: string; message: string }> }[]) => {
    if (fileRejections && fileRejections.length > 0) {
      clearErrors(name);

      const firstRejection = fileRejections[0];
      const errorCodes = firstRejection.errors.map(e => e.code);

      if (errorCodes.includes('file-too-large')) {
        setFileDropError(
          `El archivo "${firstRejection.file.name}" (${formatFileSize(firstRejection.file.size)}) excede el tamaño máximo de 5MB.`
        );
      } else {
        setFileDropError("El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.");
      }
    }
  }, [name, clearErrors]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    multiple,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isCompressing,
  });

  const removeFile = (file: File) => {
    const newFiles = myFiles.filter(f => f !== file);
    setMyFiles(newFiles);
    setValue(name, newFiles, { shouldValidate: true });
  };

  const zodError = errors[name]?.message as string | undefined;
  const displayError = fileDropError || zodError;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label.endsWith(" *") ? label.substring(0, label.length - 2) : label}
        {label.endsWith(" *") && <span className="text-red-500"> *</span>}
      </label>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed rounded-md cursor-pointer
        min-h-[120px] sm:min-h-[140px] touch-manipulation
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
        ${displayError ? 'border-red-500' : ''}
        ${isCompressing ? 'opacity-60 cursor-wait' : ''}
        hover:border-primary/50 hover:bg-gray-50 transition-colors duration-200`}
      >
        <input {...getInputProps()} />
        {isCompressing ? (
          <>
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-2 animate-spin" />
            <p className="text-sm sm:text-base text-gray-600 text-center px-2">Optimizando imágenes...</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mb-2" />
            <p className="text-sm sm:text-base text-gray-600 text-center px-2">
              {isDragActive ? 'Suelta los archivos aquí...' : 'Toca para seleccionar archivos'}
            </p>
          </>
        )}
        {description && <p className="text-xs text-gray-500 mt-2 text-center px-2">{description}</p>}
        <p className="text-xs text-gray-500 mt-2 text-center px-2">PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 5MB por archivo)</p>
      </div>
      {displayError && <p className="text-sm text-red-600 mt-1">{displayError}</p>}
      {myFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
          <ul className="space-y-2">
            {myFiles.map((file, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm truncate block" title={file.name}>{file.name}</span>
                    <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="text-red-500 hover:text-red-700 p-1 touch-manipulation flex-shrink-0 ml-2"
                  aria-label={`Eliminar archivo ${file.name}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
