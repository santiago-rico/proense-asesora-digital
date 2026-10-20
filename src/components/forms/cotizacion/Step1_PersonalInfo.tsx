import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from "@/components/ui/phone-input";
import es from 'react-phone-number-input/locale/es.json';
import { EMPLOYMENT_STATUSES_REQUIRING_OCCUPATION } from './formSchema';

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'empleado_completo', label: 'Empleado(a) a tiempo completo' },
  { value: 'empleado_parcial', label: 'Empleado(a) a tiempo parcial' },
  { value: 'autonomo', label: 'Trabajador(a) autónomo(a) / Freelance' },
  { value: 'desempleado', label: 'Desempleado(a)' },
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'jubilado', label: 'Jubilado(a)' },
  { value: 'ama_casa', label: 'Ama de casa' },
  { value: 'incapacidad', label: 'Incapacidad laboral' },
];

const Step1_PersonalInfo = () => {
  const { control, watch, setValue } = useFormContext();

  // Watch employment status to conditionally show occupation sector field
  const employmentStatus = watch('employmentStatus');
  const showsOccupation = EMPLOYMENT_STATUSES_REQUIRING_OCCUPATION.includes(employmentStatus);

  return (
    <div className="space-y-6">
      {/* First Name and Last Name - Side by Side on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Tu nombre"
                  autoComplete="given-name"
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
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  required
                  aria-required="true"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Birth Date - Composite Field */}
      <div>
        <FormLabel className="block mb-2">Fecha de nacimiento <span className="text-red-500">*</span></FormLabel>
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={control}
            name="birthDate.day"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Día"
                    min="1"
                    max="31"
                    autoComplete="bday-day"
                    required
                    aria-required="true"
                    aria-label="Día de nacimiento"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="birthDate.month"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger aria-label="Mes de nacimiento">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="birthDate.year"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Año"
                    min="1900"
                    max={new Date().getFullYear()}
                    autoComplete="bday-year"
                    required
                    aria-required="true"
                    aria-label="Año de nacimiento"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Phone Number */}
      <FormField
        control={control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de teléfono <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <PhoneInput
                placeholder="Número telefónico"
                defaultCountry="CO"
                labels={es}
                searchPlaceholder="Buscar país..."
                autoComplete="tel"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Cedula */}
      <FormField
        control={control}
        name="cedula"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de cédula <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Tu número de cédula"
                autoComplete="on"
                inputMode="numeric"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City */}
      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Tu ciudad"
                autoComplete="address-level2"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address */}
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Tu dirección completa"
                autoComplete="street-address"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Employment Status */}
      <FormField
        control={control}
        name="employmentStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado laboral <span className="text-red-500">*</span></FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // The sector is hidden for this status: drop any value typed for
                // the previous one, so it doesn't reach the summary or the email.
                if (!EMPLOYMENT_STATUSES_REQUIRING_OCCUPATION.includes(value)) {
                  setValue('occupationSector', '');
                }
              }}
              value={field.value || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione su estado laboral" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional: Occupation Sector - Show for specific employment statuses */}
      {showsOccupation && (
        <FormField
          control={control}
          name="occupationSector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actividad laboral o sector económico <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Tecnología, Salud, Educación, etc."
                  autoComplete="organization-title"
                  required
                  aria-required="true"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default Step1_PersonalInfo;
