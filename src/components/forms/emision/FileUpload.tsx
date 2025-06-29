import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

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

  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    setFileDropError(null); // Clear previous drop rejection error
    clearErrors(name); // Clear previous react-hook-form error for this field
    const currentFiles = getValues(name) || [];
    const newFiles = multiple ? [...currentFiles, ...acceptedFiles] : acceptedFiles;
    setMyFiles(newFiles);
    setValue(name, newFiles, { shouldValidate: true });
  }, [multiple, name, setValue, getValues, clearErrors]);

  const onDropRejected = useCallback((fileRejections: { file: File; errors: Array<{ code: string; message: string }> }[]) => {
    if (fileRejections && fileRejections.length > 0) {
      clearErrors(name); // Clear existing Zod error for this field
      setFileDropError("El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.");
    }
  }, [name, clearErrors]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
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
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
        ${displayError ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-500 mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Suelta los archivos aquí...' : 'Arrastra y suelta archivos aquí, o haz clic para seleccionar'}
        </p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG, WEBP, DOC, DOCX. (Max 5MB)</p>
      </div>
      {displayError && <p className="text-sm text-red-600 mt-1">{displayError}</p>}
      {myFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Archivos seleccionados:</h4>
          <ul className="space-y-2">
            {myFiles.map((file, i) => (
              <li key={i} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <button type="button" onClick={() => removeFile(file)} className="text-red-500 hover:text-red-700">
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
