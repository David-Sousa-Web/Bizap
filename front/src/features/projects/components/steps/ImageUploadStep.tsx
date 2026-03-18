import { useCallback, useRef, useState } from "react"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadStepProps {
  imageFile: File | null
  onImageChange: (file: File | null) => void
}

export function ImageUploadStep({
  imageFile,
  onImageChange,
}: ImageUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (file && !file.type.startsWith("image/")) return
      onImageChange(file)
    },
    [onImageChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0] ?? null
      handleFileSelect(file)
    },
    [handleFileSelect],
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Imagem do projeto</h2>
        <p className="text-sm text-muted-foreground">
          Adicione uma imagem para identificar visualmente seu projeto. Esta
          etapa é <strong>opcional</strong>.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-40">
            <img
              src={previewUrl}
              alt="Preview"
              className="size-full rounded-full object-cover ring-2 ring-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              Trocar imagem
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onImageChange(null)}
            >
              <Trash2 className="size-4" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/40",
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ImagePlus className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              Clique ou arraste uma imagem aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou WebP
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
