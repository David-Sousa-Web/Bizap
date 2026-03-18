import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardStep {
  label: string
}

interface WizardStepperProps {
  steps: WizardStep[]
  currentStep: number
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Etapas do wizard" className="w-full">
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <li key={step.label} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isActive &&
                      "border-primary text-primary",
                    !isCompleted &&
                      !isActive &&
                      "border-muted-foreground/30 text-muted-foreground/50",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] leading-tight text-center truncate w-full",
                    isActive && "font-semibold text-foreground",
                    isCompleted && "text-foreground",
                    !isCompleted && !isActive && "text-muted-foreground/60",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 -mt-5",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
