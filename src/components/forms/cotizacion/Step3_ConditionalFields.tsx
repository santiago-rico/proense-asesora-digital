import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Sub-component for Vida (Life Insurance) Fields
const VidaFields = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="monthlyIncome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ingreso mensual <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Tu ingreso mensual"
                autoComplete="off"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="maritalStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado civil <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione su estado civil" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="soltero">Soltero/a</SelectItem>
                <SelectItem value="casado">Casado/a</SelectItem>
                <SelectItem value="union_libre">Unión libre</SelectItem>
                <SelectItem value="divorciado">Divorciado/a</SelectItem>
                <SelectItem value="viudo">Viudo/a</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="hasChildren"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Tiene hijos? <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="si">Sí</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

// Sub-component for Auto (Car Insurance) Fields
const AutoFields = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="vehicleMake"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca del vehículo <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Toyota, Chevrolet, etc."
                autoComplete="off"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="vehicleModel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo del vehículo <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Corolla, Spark, etc."
                autoComplete="off"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="vehicleYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Año del vehículo <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 2020"
                autoComplete="off"
                required
                aria-required="true"
                min="1900"
                max={new Date().getFullYear() + 1}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

// Sub-component for Hogar (Home Insurance) Fields
const HogarFields = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="propertyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de propiedad <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de propiedad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="propertyValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor de la propiedad <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Valor estimado de la propiedad"
                autoComplete="off"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

// Sub-component for Salud (Health Insurance) Fields
const SaludFields = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="preExistingConditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condiciones preexistentes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe cualquier condición de salud preexistente (opcional)"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

// Sub-component for Mascotas (Pet Insurance) Fields
const MascotasFields = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="petType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de mascota <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de mascota" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="perro">Perro</SelectItem>
                <SelectItem value="gato">Gato</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="petName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la mascota <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Nombre de tu mascota"
                autoComplete="off"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="petAge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Edad de la mascota <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Edad en años"
                autoComplete="off"
                required
                aria-required="true"
                min="0"
                max="30"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

// Main Component
const Step3_ConditionalFields = () => {
  const { watch } = useFormContext();
  const insuranceType = watch('insuranceType');

  const renderFieldsForInsuranceType = () => {
    switch (insuranceType) {
      case 'vida':
        return <VidaFields />;
      case 'auto':
        return <AutoFields />;
      case 'hogar':
        return <HogarFields />;
      case 'salud':
        return <SaludFields />;
      case 'mascotas':
        return <MascotasFields />;
      default:
        return <p>Por favor, selecciona un tipo de seguro para continuar.</p>;
    }
  };

  return <div className="space-y-6">{renderFieldsForInsuranceType()}</div>;
};

export default Step3_ConditionalFields;
