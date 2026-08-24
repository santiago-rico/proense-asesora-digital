import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Sub-component for Vida (Life Insurance) Fields
const VidaFields = () => {
  const { control, watch } = useFormContext();
  const practicesSports = watch('practicesSports');
  const hasHealthConditions = watch('hasHealthConditions');

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
      <FormField
        control={control}
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estatura (en cm) <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 162"
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
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Peso (en kg) <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 58"
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
        name="epsName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>EPS a la que está afiliado <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Escribe el nombre de la EPS"
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
        name="practicesSports"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Practicas algún deporte <span className="text-red-500">*</span></FormLabel>
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
      {practicesSports === 'si' && (
        <FormField
          control={control}
          name="sportsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Qué deportes practicas? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Escribe los deportes que practicas"
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
      )}
      <FormField
        control={control}
        name="hasHealthConditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Tienes o padeces alguna enfermedad? <span className="text-red-500">*</span></FormLabel>
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
      {hasHealthConditions === 'si' && (
        <FormField
          control={control}
          name="healthConditionsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Qué enfermedades? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe brevemente."
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
      )}
    </>
  );
};

// Sub-component for Auto (Car Insurance) Fields
const AutoFields = () => {
  const { control, watch } = useFormContext();
  const hasAccessories = watch('hasAccessories');

  return (
    <>
      <FormField
        control={control}
        name="vehiclePlate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa del vehículo <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Escribe la placa del vehículo"
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
        name="vehicleCity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad de circulación <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Escribe la ciudad de circulación"
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
        name="vehicleType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de vehículo <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="nuevo">Nuevo (0 Km)</SelectItem>
                <SelectItem value="usado">Usado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="vehicleUse"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Uso del principal del vehículo <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="familiar">Familiar</SelectItem>
                <SelectItem value="trabajo">Trabajo</SelectItem>
                <SelectItem value="empresa">Al servicio de una empresa</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="hasAccessories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿El vehículo tiene accesorios o modificaciones?</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
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
      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
        Los accesorios son aquellas modificaciones o adecuación que se le han realizado al vehículo, como planta de sonido, ductos de escape, rines de lujo, entre otros.
      </div>
      {hasAccessories === 'si' && (
        <>
          <FormField
            control={control}
            name="accessoriesValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor estimado de accesorios <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Escribe el valor estimado"
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
            name="accessoriesType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de accesorios <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Elige una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planta_sonido">Planta de sonido</SelectItem>
                    <SelectItem value="ductos_escape">Ductos de escape</SelectItem>
                    <SelectItem value="rines_lujo">Rines de lujo</SelectItem>
                    <SelectItem value="pintura_personalizada">Pintura personalizada</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
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
        name="insuredPropertyAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección del inmueble a asegurar <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Escribe la dirección del inmueble"
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
      <FormField
        control={control}
        name="insuredPropertyCity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad del inmueble a asegurar <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Escribe la ciudad del inmueble"
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
      <FormField
        control={control}
        name="buildingFloors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de pisos del edificio (Opcional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 5"
                autoComplete="off"
                min="1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="estrato"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estrato <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estrato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="estrato_1">Estrato 1</SelectItem>
                <SelectItem value="estrato_2">Estrato 2</SelectItem>
                <SelectItem value="estrato_3">Estrato 3</SelectItem>
                <SelectItem value="estrato_4">Estrato 4</SelectItem>
                <SelectItem value="estrato_5">Estrato 5</SelectItem>
                <SelectItem value="estrato_6">Estrato 6</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="propertyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de vivienda <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de vivienda" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="casa_campestre">Casa Campestre</SelectItem>
                <SelectItem value="finca">Finca</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="propertyUse"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Uso de la vivienda <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el uso de la vivienda" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="arrendamiento">Arrendamiento</SelectItem>
                <SelectItem value="propio">Propio</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="residesInProperty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Habitas la vivienda? <span className="text-red-500">*</span></FormLabel>
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
      <FormField
        control={control}
        name="propertyArea"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area de la vivienda (M2) <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Area de la propiedad"
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
        name="hasEconomicActivity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Se desarrolla alguna actividad económica? <span className="text-red-500">*</span></FormLabel>
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
      <FormField
        control={control}
        name="propertyValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor comercial de la vivienda (En pesos) <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="$"
                autoComplete="off"
                min="1"
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
        name="contentsValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor de reposición de los contenidos (Opcional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="$"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="insuranceMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Cómo deseas asegurar el predio? <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="valor_comercial">Valor comercial</SelectItem>
                <SelectItem value="valor_reconstruccion">Valor de reconstrucción</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

// Sub-component for Salud (Health Insurance) Fields
const SaludFields = () => {
  const { control, watch } = useFormContext();
  const practicesSports = watch('practicesSports');
  const hasHealthConditions = watch('hasHealthConditions');

  return (
    <>
      <FormField
        control={control}
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estatura (en cm) <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 178"
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
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Peso (en kg) <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 80"
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
        name="epsName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>EPS a la que está afiliado <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Escribe el nombre de la EPS"
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
        name="practicesSports"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Practicas algún deporte <span className="text-red-500">*</span></FormLabel>
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
      {practicesSports === 'si' && (
        <FormField
          control={control}
          name="sportsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Qué deportes practicas? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Escribe los deportes que practicas"
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
      )}
      <FormField
        control={control}
        name="hasHealthConditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Tienes o padeces alguna enfermedad? <span className="text-red-500">*</span></FormLabel>
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
      {hasHealthConditions === 'si' && (
        <FormField
          control={control}
          name="healthConditionsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Qué enfermedades? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe brevemente."
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
      )}
    </>
  );
};

// Sub-component for Mascotas (Pet Insurance) Fields
const MascotasFields = () => {
  const { control, watch } = useFormContext();
  const petHasSeriousIllness = watch('petHasSeriousIllness');

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
                  <SelectValue placeholder="Elige una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="perro">Perro</SelectItem>
                <SelectItem value="gato">Gato</SelectItem>
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
            <FormLabel>Nombre de tu mascota <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Responde en pocas palabras"
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
        name="petGender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sexo de tu mascota <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="hembra">Hembra</SelectItem>
                <SelectItem value="macho">Macho</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="petAge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Escribe la edad de tu mascota <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Responde en pocas palabras"
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
        name="petBreed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Raza de tu mascota <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Escribe la raza de tu mascota"
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
        name="petVaccinated"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tu mascota tiene el esquema de vacunas al día</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
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
      <FormField
        control={control}
        name="petHasSeriousIllness"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Tu mascota ha tenido enfermedades o accidentes graves en el último año? <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
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
      {petHasSeriousIllness === 'si' && (
        <FormField
          control={control}
          name="petSeriousIllnessDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Qué enfermedades o accidentes tuvo tu mascota? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe las enfermedades o accidentes que ha tenido tu mascota"
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
      )}
    </>
  );
};

// Main Component
const Step3_ConditionalFields = () => {
  const { control, watch } = useFormContext();
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

  return (
    <div className="space-y-6">
      {renderFieldsForInsuranceType()}

      {insuranceType && (
        <FormField
          control={control}
          name="additionalComments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentarios adicionales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="¿Hay algo más que quieras compartir o preguntar sobre tu cotización?"
                  autoComplete="off"
                  rows={4}
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

export default Step3_ConditionalFields;
