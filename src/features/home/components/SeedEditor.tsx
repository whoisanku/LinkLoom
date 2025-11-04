import Button from '@/components/ui/Button'
import { useForm, FormProvider } from 'react-hook-form'
import { useEffect } from 'react'
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

const SeedEditor = ({ title, color, type, values, onChange, onRemove, onAdd }: SeedEditorProps) => {
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAdd}
            className="border-white/30 text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white hover:border-white/50"
          >
            + Add
          </Button>
        </div>

        <FormProvider {...form}>
          <div className="flex flex-col gap-3">
            {values.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-sm text-white/40">
                No handles yet. Add your signal candidates.
              </div>
            )}
            {values.map((value, index) => (
              <div key={`${type}-${index}`} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-primary/40 p-4">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-[0.35em] text-white/40">
                    {title} #{index + 1}
                  </label>
                  <TextField
                    name={`seed-${type}-${index}`}
                    value={value}
                    onChange={(event) => onChange(type, index, event.target.value)}
                    placeholder="@handle"
                    customLabel=""
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white/70 hover:text-white hover:border-white/40"
                  onClick={() => onRemove(type, index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </FormProvider>
      </div>
    </div>
  )
}

export default SeedEditor
