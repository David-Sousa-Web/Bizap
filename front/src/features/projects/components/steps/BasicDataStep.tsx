import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateProjectFormData } from "@/features/projects/schemas/createProjectSchema"

export function BasicDataStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateProjectFormData>()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Dados básicos</h2>
        <p className="text-sm text-muted-foreground">
          Preencha as informações iniciais do seu projeto.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">
            Nome do projeto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ex: Campanha Black Friday"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phoneNumber">
            Telefone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phoneNumber"
            placeholder="Ex: +5511999999999"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="agency">Agência</Label>
          <Input
            id="agency"
            placeholder="Ex: Agência XYZ (opcional)"
            {...register("agency")}
          />
        </div>
      </div>
    </div>
  )
}
