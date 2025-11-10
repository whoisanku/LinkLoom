import Button from '@/components/ui/Button'
import { useForm, FormProvider } from 'react-hook-form'
import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import TextField from '@/components/ui/TextField'

type SeedEditorProps = {
  title: string
  color: string
  type: 'farcaster' | 'twitter'
  values: string[]
  onChange: (type: 'farcaster' | 'twitter', index: number, value: string) => void
  onRemove: (type: 'farcaster' | 'twitter', index: number) => void
  onAdd: () => void
}

type EditModalProps = {
  value: string
  index: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (value: string) => void
  onRemove: () => void
}

const EditModal = ({ value, index, isOpen, onOpenChange, onConfirm, onRemove }: EditModalProps) => {
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    if (isOpen) setEditValue(value)
  }, [isOpen, value])

  const handleConfirm = () => {
    onConfirm(editValue)
    onOpenChange(false)
  }

  const handleRemove = () => {
    onRemove()
    onOpenChange(false)
  }

  return (
    <Modal
      trigger={
        <div className="border border-white/40 px-5 py-2 rounded-full cursor-pointer hover:border-white/60 transition-colors min-w-[100px] text-center opacity-50">
          {value || '---'}
        </div>
      }
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Edit Handle</h3>
        <TextField
          name={`seed-${index}`}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="@handle"
          customLabel=""
        />
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRemove}
            className="text-red-400 border-red-400 hover:bg-red-400/10"
          >
            Remove
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const SeedEditor = ({ title, color, type, values, onChange, onRemove, onAdd }: SeedEditorProps) => {
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null)

  const form = useForm<{ seeds: string[] }>({
    defaultValues: { seeds: values },
  })

  useEffect(() => {
    form.reset({ seeds: values })
  }, [values, form])

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-6 backdrop-blur`}>
      <div className={`absolute inset-0 bg-linear-to-br ${color} to-transparent opacity-50`} />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold uppercase tracking-[0.35em] text-white/80">{title}</h3>
        </div>
        <FormProvider {...form}>
          <div className="flex flex-wrap gap-3">
            {values.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-sm text-white/40">
                No handles yet. Add your signal candidates.
              </div>
            )}
            {values.map((value, index) => (
              <EditModal
                key={`${type}-${index}`}
                value={value}
                index={index}
                isOpen={openModalIndex === index}
                onOpenChange={(open) => setOpenModalIndex(open ? index : null)}
                onConfirm={(newValue) => onChange(type, index, newValue)}
                onRemove={() => onRemove(type, index)}
              />
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAdd}
              className="rounded-full w-9 h-9 flex items-center justify-center text-md "
            >
              +
            </Button>
          </div>
        </FormProvider>
      </div>
    </div>
  )
}

export default SeedEditor
