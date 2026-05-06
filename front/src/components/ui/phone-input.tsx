import * as React from "react"
import { NumberFormatBase } from "react-number-format"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: string
  defaultValue?: string | number
  onChange?: (value: string) => void
}

const COUNTRIES = [
  { code: "+55", label: "Brasil", flag: "🇧🇷" },
  { code: "+1", label: "EUA/Canadá", flag: "🇺🇸" },
  { code: "+351", label: "Portugal", flag: "🇵🇹" },
  { code: "+44", label: "Reino Unido", flag: "🇬🇧" },
  { code: "+34", label: "Espanha", flag: "🇪🇸" },
  { code: "+54", label: "Argentina", flag: "🇦🇷" },
  { code: "+56", label: "Argentina", flag: "🇨🇱" }, // Chile
  { code: "+57", label: "Chile", flag: "🇨🇴" }, // Colombia is +57, Chile +56
  { code: "+52", label: "México", flag: "🇲🇽" },
]

// Fix labels
COUNTRIES.find(c => c.code === "+56")!.label = "Chile"
COUNTRIES.find(c => c.code === "+57")!.label = "Colômbia"

const formatBrazil = (val: string) => {
  const clean = val.replace(/\D/g, "").slice(0, 11)
  if (clean.length === 0) return ""
  if (clean.length <= 2) return `(${clean}`
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, disabled, "aria-invalid": ariaInvalid, type = "tel", ...props }, ref) => {
    const [ddi, setDdi] = React.useState("+55")
    const [localNumber, setLocalNumber] = React.useState("")

    React.useEffect(() => {
      if (value) {
        // Try to match a known DDI
        const country = COUNTRIES.find((c) => value.startsWith(c.code))
        if (country) {
          setDdi(country.code)
          setLocalNumber(value.slice(country.code.length))
        } else {
          // Fallback if not matching known DDI, just try to extract +XXX
          const match = value.match(/^(\+\d{1,3})(\d*)$/)
          if (match) {
            setDdi(match[1])
            setLocalNumber(match[2])
          } else {
            setLocalNumber(value)
          }
        }
      } else {
        setLocalNumber("")
      }
    }, [value])

    const handleDdiChange = (newDdi: string) => {
      setDdi(newDdi)
      if (onChange) {
        onChange(`${newDdi}${localNumber}`)
      }
    }

    const handleNumberChange = (newNumber: string) => {
      setLocalNumber(newNumber)
      if (onChange) {
        onChange(`${ddi}${newNumber}`)
      }
    }

    return (
      <div className={cn("flex gap-2", className)}>
        <Select value={ddi} onValueChange={handleDdiChange} disabled={disabled}>
          <SelectTrigger className="w-[110px] shrink-0" aria-invalid={ariaInvalid}>
            <SelectValue placeholder="DDI" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {ddi === "+55" ? (
          <NumberFormatBase
            format={formatBrazil}
            value={localNumber}
            onValueChange={(values) => handleNumberChange(values.value)}
            customInput={Input}
            getInputRef={ref}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            type={type as "text" | "tel" | "password"}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            {...props}
          />
        ) : (
          <NumberFormatBase
            format={(val) => val.replace(/\D/g, "")} // Only numbers
            value={localNumber}
            onValueChange={(values) => handleNumberChange(values.value)}
            customInput={Input}
            getInputRef={ref}
            placeholder="Número"
            inputMode="tel"
            type={type as "text" | "tel" | "password"}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            {...props}
          />
        )}
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"
