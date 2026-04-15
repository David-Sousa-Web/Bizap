import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { WizardStepper } from "@/features/projects/components/WizardStepper"
import { BasicDataStep } from "@/features/projects/components/steps/BasicDataStep"
import { TemplateSelectionStep } from "@/features/projects/components/steps/TemplateSelectionStep"
import { FlowMessageStep } from "@/features/projects/components/steps/FlowMessageStep"
import { ImageUploadStep } from "@/features/projects/components/steps/ImageUploadStep"
import { SummaryStep } from "@/features/projects/components/steps/SummaryStep"
import { useCreateProject } from "@/features/projects/hooks/useCreateProject"
import { useUploadProjectImage } from "@/features/projects/hooks/useUploadProjectImage"
import {
  createProjectSchema,
  basicDataSchema,
  templateSchema,
  flowMessageSchema,
  type CreateProjectFormData,
} from "@/features/projects/schemas/createProjectSchema"

const STEPS = [
  { label: "Dados" },
  { label: "Template" },
  { label: "Mensagem" },
  { label: "Imagem" },
  { label: "Resumo" },
]

const STEP_SCHEMAS = [basicDataSchema, templateSchema, flowMessageSchema]

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const createProject = useCreateProject()
  const uploadImage = useUploadProjectImage()

  const isSubmitting = createProject.isPending || uploadImage.isPending

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      agency: "",
      templateSid: "",
      flowMessage: "",
    },
    mode: "onTouched",
  })

  async function validateCurrentStep(): Promise<boolean> {
    const schema = STEP_SCHEMAS[currentStep]
    if (!schema) return true // steps 3 (image) and 4 (summary) have no schema

    const values = form.getValues()
    const result = schema.safeParse(values)

    if (!result.success) {
      // Trigger validation on all fields of this step
      const fields = Object.keys(
        schema.shape,
      ) as (keyof CreateProjectFormData)[]
      for (const field of fields) {
        await form.trigger(field)
      }
      return false
    }
    return true
  }

  async function handleNext() {
    const isValid = await validateCurrentStep()
    if (!isValid) return
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  function handlePrev() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  function handleGoToStep(step: number) {
    setCurrentStep(step)
  }

  async function handleSubmit() {
    const isValid = await form.trigger()
    if (!isValid) return

    try {
      const values = form.getValues()
      const payload = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        agency: values.agency || undefined,
        templateSid: values.templateSid,
        flowMessage: values.flowMessage,
      }

      const response = await createProject.mutateAsync(payload)
      const projectId = response.data?.id

      if (imageFile && projectId) {
        try {
          await uploadImage.mutateAsync({ projectId, file: imageFile })
        } catch {
          toast.warning(
            "Projeto criado, mas houve um erro ao enviar a imagem. Você pode tentar novamente depois.",
          )
          navigate("/projetos")
          return
        }
      }

      toast.success("Projeto criado com sucesso!")
      navigate("/projetos")
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Já existe um projeto com esse nome. Escolha outro nome.")
        setCurrentStep(0)
        return
      }
      toast.error("Erro ao criar o projeto. Tente novamente.")
    }
  }

  const isLastStep = currentStep === STEPS.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate("/projetos")}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Novo Projeto</h1>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <WizardStepper steps={STEPS} currentStep={currentStep} />
      </div>

      <FormProvider {...form}>
        <div className="mx-auto w-full max-w-4xl">
          {currentStep === 0 && <BasicDataStep />}
          {currentStep === 1 && <TemplateSelectionStep />}
          {currentStep === 2 && <FlowMessageStep />}
          {currentStep === 3 && (
            <ImageUploadStep
              imageFile={imageFile}
              onImageChange={setImageFile}
            />
          )}
          {currentStep === 4 && (
            <SummaryStep imageFile={imageFile} onGoToStep={handleGoToStep} />
          )}

          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstStep || isSubmitting}
            >
              <ArrowLeft className="size-4" />
              Anterior
            </Button>

            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {isSubmitting ? "Criando..." : "Criar Projeto"}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                {currentStep === 3 && !imageFile ? "Pular" : "Próximo"}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </FormProvider>
    </div>
  )
}
