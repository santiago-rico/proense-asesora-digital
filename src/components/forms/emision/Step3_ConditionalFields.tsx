import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import FileUpload from './FileUpload';

const Step3_ConditionalFields = () => {
  const { control, watch } = useFormContext();
  const tipoSeguro = watch('tipoSeguro');

  const renderCommonFields = () => (
    <>
      <FormField
        control={control}
        name="numeroCedula"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de cédula <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="Tu número de cédula" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FileUpload name="fotoCedula" label="Foto cédula (ambos lados) *" description="Sube una foto de ambos lados de tu cédula." />
    </>
  );

  const renderBeneficiaryFields = () => (
      // This part can be more complex with dynamic fields, for now a simple version
      <>
        <FormField
            control={control}
            name="beneficiarios"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Nombres de beneficiarios y porcentajes <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                <Input placeholder="Ej: Maria Perez 50%, Juan Perez 50%" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FileUpload name="documentosBeneficiarios" label="Documento de identidad beneficiarios *" description="Sube una foto de ambos lados del documento por cada beneficiario." multiple />
      </>
  )

  const renderFieldsForInsuranceType = () => {
    switch (tipoSeguro) {
      case 'vida':
        return (
          <>
            {renderCommonFields()}
            {renderBeneficiaryFields()}
          </>
        );
      case 'salud':
        return (
          <>
            {renderCommonFields()}
             <FormField
                control={control}
                name="listaBeneficiarios"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Lista de beneficiarios <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                    <Input placeholder="Nombres completos de los beneficiarios" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </>
        );
      case 'hogar':
        return (
          <>
            {renderCommonFields()}
            <FileUpload name="certificadoLibertad" label="Certificado de libertad y tradición o Impuesto Predial *" />
          </>
        );
      case 'rentas': // Updated: Now requires common and beneficiary fields
        return (
          <>
            {renderCommonFields()}
            {renderBeneficiaryFields()}
          </>
        );
      case 'auto':
        return (
          <>
            {renderCommonFields()}
            <FileUpload name="tarjetaPropiedad" label="Tarjeta de propiedad (ambos lados) *" />
          </>
        );
      case 'empresarial':
        return (
          <>
            <FormField
                control={control}
                name="numeroCedulaRepLegal"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Número de cédula (Representante Legal) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                    <Input placeholder="Cédula del representante legal" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FileUpload name="fotoCedulaRepLegal" label="Imagen o documento de tu cédula por ambos lados (Representante Legal) *" description="Sube una foto de ambos lados de la cédula del representante legal." />
            <FormField
                control={control}
                name="nit"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>NIT (Sin espacios ni guiones) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                    <Input placeholder="NIT de la empresa (sin espacios ni guiones)" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FileUpload name="rut" label="RUT (Obligatorio) *" description="El documento debe estar actualizado a máximo 30 días." />
            <FileUpload name="camaraComercio" label="Cámara de comercio (Obligatorio) *" description="El documento debe estar actualizado a máximo 30 días." />
          </>
        );
      case 'mascotas':
        return <>{renderCommonFields()}</>;
      case 'responsabilidad_civil': // Updated: Now only requires common fields
        return (
          <>
            {renderCommonFields()}
          </>
        );
      default:
        return <p>Por favor, selecciona un tipo de seguro para continuar.</p>;
    }
  };

  return <div className="space-y-6">{renderFieldsForInsuranceType()}</div>;
};

export default Step3_ConditionalFields;
