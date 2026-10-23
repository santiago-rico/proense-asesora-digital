import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Sí/No questions whose "Sí" reveals the fields listed for it. Any other answer
// hides those fields again, so what was typed in them is dropped: like the
// owner fields of "tercero" (TERCERO_FIELDS), a hidden answer must not reach
// the summary or the email.
const DETAILS_SHOWN_ON_SI = {
  practicesSports: ['sportsDetails'],
  hasHealthConditions: ['healthConditionsDetails'],
  hasAccessories: ['accessoriesValue', 'accessoriesType'],
  // Not asked of arrendatarios (they always insure contents), so "No" hides these.
  wantsContentsCoverage: ['contentsValue', 'electricContentsValue', 'theftValue', 'portableContentsValue'],
  petHasSeriousIllness: ['petSeriousIllnessDetails'],
} as const;

type QuestionWithDetails = keyof typeof DETAILS_SHOWN_ON_SI;

/**
 * `onValueChange` for the select of a DETAILS_SHOWN_ON_SI question: records the
 * answer and, unless it is "Sí", clears the detail fields it hides.
 */
const useOnYesNoChange = () => {
  const { setValue } = useFormContext();
  return (field: { name: QuestionWithDetails; onChange: (value: string) => void }) =>
    (value: string) => {
      field.onChange(value);
      if (value !== 'si') {
        DETAILS_SHOWN_ON_SI[field.name].forEach((name) => setValue(name, ''));
      }
    };
};

// Sub-component for Vida (Life Insurance) Fields
const VidaFields = () => {
  const { control, watch } = useFormContext();
  const onYesNoChange = useOnYesNoChange();
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
            <Select onValueChange={onYesNoChange(field)} value={field.value || ''}>
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
            <Select onValueChange={onYesNoChange(field)} value={field.value || ''}>
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
  const onYesNoChange = useOnYesNoChange();
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
            <Select onValueChange={onYesNoChange(field)} value={field.value || ''}>
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

// Section heading used to group the hogar fields
const HogarSectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700 first:pt-0 first:border-t-0">
    {children}
  </h4>
);

// Owner details, asked only when quoting on behalf of the owner (tercero).
const TERCERO_FIELDS = ['ownerName', 'ownerCedula', 'ownerBirthDate', 'residesInProperty'] as const;

// Not asked of an arrendatario, who insures the contents but not the structure.
const NOT_ASKED_OF_ARRENDATARIO = ['propertyValue', 'insuranceMethod', 'wantsContentsCoverage'] as const;

// Sub-component for Hogar (Home Insurance) Fields
const HogarFields = () => {
  const { control, watch, setValue } = useFormContext();
  const onYesNoChange = useOnYesNoChange();
  const propertyRelationship = watch('propertyRelationship');
  const propertyType = watch('propertyType');
  const wantsContentsCoverage = watch('wantsContentsCoverage');

  const isArrendatario = propertyRelationship === 'arrendatario';
  const isTercero = propertyRelationship === 'tercero';
  const isApartamento = propertyType === 'apartamento';
  const showContentsFields = isArrendatario || wantsContentsCoverage === 'si';

  return (
    <>
      <HogarSectionHeading>Relación con el inmueble</HogarSectionHeading>
      <FormField
        control={control}
        name="propertyRelationship"
        render={({ field }) => (
          <FormItem>
            <FormLabel>¿Cuál es tu relación con el inmueble? <span className="text-red-500">*</span></FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Drop the answers this relationship hides, so they don't reach
                // the summary or the email.
                if (value !== 'tercero') {
                  TERCERO_FIELDS.forEach((name) => setValue(name, ''));
                }
                if (value === 'arrendatario') {
                  NOT_ASKED_OF_ARRENDATARIO.forEach((name) => setValue(name, ''));
                }
              }}
              value={field.value || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="propietario_habita">Propietario/a y habito el inmueble</SelectItem>
                <SelectItem value="propietario_no_habita">Propietario/a, no lo habito (arrendado o desocupado)</SelectItem>
                <SelectItem value="arrendatario">Arrendatario/a — vivo en arriendo</SelectItem>
                <SelectItem value="tercero">Cotizo a nombre del propietario (otra persona)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {isTercero && (
        <>
          <FormField
            control={control}
            name="ownerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo del propietario <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="Escribe el nombre completo del propietario"
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
            name="ownerCedula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula del propietario <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="Escribe la cédula del propietario"
                    autoComplete="off"
                    inputMode="numeric"
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
            name="ownerBirthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento del propietario (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="DD/MM/AAAA"
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
            name="residesInProperty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿El propietario habita el inmueble? <span className="text-red-500">*</span></FormLabel>
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
      )}

      <HogarSectionHeading>Ubicación y características</HogarSectionHeading>
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
        name="propertyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de vivienda <span className="text-red-500">*</span></FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Only an apartment is asked its floor.
                if (value !== 'apartamento') setValue('unitFloor', '');
              }}
              value={field.value || ''}
            >
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
        name="constructionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de construcción <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="concreto_reforzado">Concreto reforzado</SelectItem>
                <SelectItem value="mamposteria_estructural">Mampostería estructural</SelectItem>
                <SelectItem value="mamposteria_confinada">Mampostería confinada</SelectItem>
                <SelectItem value="prefabricado">Prefabricado</SelectItem>
                <SelectItem value="madera_bahareque">Madera / bahareque</SelectItem>
                <SelectItem value="no_sabe">No estoy seguro/a</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              El material estructural principal de la vivienda. Si no lo sabes, elige 'No estoy seguro/a'.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="constructionYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Año de construcción (aproximado) <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 2005"
                autoComplete="off"
                min="1900"
                required
                aria-required="true"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {isApartamento && (
        <FormField
          control={control}
          name="unitFloor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Piso en el que se ubica el apartamento <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 3"
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
      )}
      <FormField
        control={control}
        name="buildingFloors"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isApartamento ? (
                <>Total de pisos del edificio <span className="text-red-500">*</span></>
              ) : (
                <>Número de pisos de la vivienda (Opcional)</>
              )}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 5"
                autoComplete="off"
                min="1"
                required={isApartamento}
                aria-required={isApartamento ? 'true' : undefined}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="basementCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de sótanos (Opcional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 1"
                autoComplete="off"
                min="0"
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

      <HogarSectionHeading>Valores a asegurar</HogarSectionHeading>
      {!isArrendatario && (
        <>
          <FormField
            control={control}
            name="propertyValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor de la propiedad (en pesos) <span className="text-red-500">*</span></FormLabel>
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
                <FormDescription>
                  Para apartamentos indica el valor de tu apartamento, no del edificio completo. No incluyas el valor del terreno.
                </FormDescription>
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
          <FormField
            control={control}
            name="wantsContentsCoverage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Deseas asegurar también los contenidos de tu hogar? <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={onYesNoChange(field)} value={field.value || ''}>
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
      )}
      {isArrendatario && (
        <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
          Como arrendatario/a, tu seguro cubre los contenidos de tu hogar.
        </div>
      )}
      {showContentsFields && (
        <>
          <FormField
            control={control}
            name="contentsValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor de los contenidos (muebles y enseres) <span className="text-red-500">*</span></FormLabel>
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
            name="electricContentsValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor de contenidos eléctricos (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="$"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Electrodomésticos y equipos eléctricos fijos.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="theftValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor a asegurar por hurto (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="$"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Normalmente un porcentaje del valor de los contenidos.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="portableContentsValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Todo riesgo contenidos portátiles (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="$"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Portátiles, celulares, cámaras y otros equipos que salen de casa.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};

// Sub-component for Salud (Health Insurance) Fields
const SaludFields = () => {
  const { control, watch } = useFormContext();
  const onYesNoChange = useOnYesNoChange();
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
            <Select onValueChange={onYesNoChange(field)} value={field.value || ''}>
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
            <Select onValueChange={onYesNoChange(field)} value={field.value || ''}>
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
  const onYesNoChange = useOnYesNoChange();
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
            <Select onValueChange={onYesNoChange(field)} value={field.value || ''}>
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
