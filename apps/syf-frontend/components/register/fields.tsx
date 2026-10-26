"use client"

import { useEffect, useMemo, type ComponentProps, type ReactNode } from "react"
import { Check, ImageUp } from "lucide-react"
import { cn } from "@/lib/utils"

/** Form controls for the registration form, on paper/mist backgrounds. */

export const fieldId = (name: string) => `reg-${name}`

const inputClass =
  "h-12 w-full rounded-lg border border-line bg-paper px-4 text-[0.9375rem] text-navy shadow-[0_1px_0_rgb(14_26_43/0.03)] transition-colors placeholder:text-ink-muted/55 hover:border-silver-dim focus-visible:border-royal aria-invalid:border-red-600"

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
      {children}
    </label>
  )
}

function Message({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error)
    return (
      <p id={`${id}-msg`} className="text-sm font-medium text-red-700">
        {error}
      </p>
    )
  if (hint)
    return (
      <p id={`${id}-msg`} className="text-sm text-ink-muted">
        {hint}
      </p>
    )
  return null
}

type TextFieldProps = Omit<ComponentProps<"input">, "id" | "name" | "onChange"> & {
  name: string
  label: string
  error?: string
  hint?: string
  prefix?: string
  onValue: (value: string) => void
}

export function TextField({ name, label, error, hint, prefix, onValue, className, ...rest }: TextFieldProps) {
  const id = fieldId(name)
  const described = error || hint ? `${id}-msg` : undefined
  const input = (
    <input
      id={id}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={described}
      onChange={(e) => onValue(e.target.value)}
      className={cn(inputClass, prefix && "rounded-l-none", className)}
      {...rest}
    />
  )
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {prefix ? (
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-line bg-mist px-3 text-[0.9375rem] font-medium text-ink-muted">
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      <Message id={id} error={error} hint={hint} />
    </div>
  )
}

type SelectFieldProps = {
  name: string
  label: string
  value: string
  options: (string | number)[]
  placeholder: string
  error?: string
  hint?: string
  onValue: (value: string) => void
}

export function SelectField({ name, label, value, options, placeholder, error, hint, onValue }: SelectFieldProps) {
  const id = fieldId(name)
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        onChange={(e) => onValue(e.target.value)}
        className={cn(inputClass, "cursor-pointer appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={String(o)}>
            {o}
          </option>
        ))}
      </select>
      <Message id={id} error={error} hint={hint} />
    </div>
  )
}

type ChoiceGroupProps = {
  name: string
  legend: string
  options: string[]
  value: string
  error?: string
  /** Tailwind grid classes for the option tiles. */
  columns?: string
  onValue: (value: string) => void
}

/** A radio group drawn as selectable tiles. The first radio carries the field id, for error focus. */
export function ChoiceGroup({ name, legend, options, value, error, columns = "sm:grid-cols-2", onValue }: ChoiceGroupProps) {
  const id = fieldId(name)
  return (
    <fieldset aria-describedby={error ? `${id}-msg` : undefined} className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-semibold text-navy">{legend}</legend>
      <div className={cn("grid grid-cols-1 gap-2.5", columns)}>
        {options.map((option, i) => {
          const checked = value === option
          return (
            <label
              key={option}
              className={cn(
                "relative flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border bg-paper px-4 py-3 text-[0.9375rem] font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-royal",
                checked ? "border-royal bg-royal/[0.06] text-navy" : "border-line text-ink-muted hover:border-silver-dim hover:text-navy",
                error && !checked && "border-red-600/50",
              )}
            >
              <input
                type="radio"
                id={i === 0 ? id : undefined}
                name={name}
                value={option}
                checked={checked}
                onChange={() => onValue(option)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  checked ? "border-royal bg-royal text-white" : "border-silver-dim bg-paper",
                )}
              >
                {checked && <Check className="size-3" strokeWidth={3} />}
              </span>
              {option}
            </label>
          )
        })}
      </div>
      <Message id={id} error={error} />
    </fieldset>
  )
}

type PhotoFieldProps = {
  name: string
  label: string
  hint: string
  value: File | string | null
  error?: string
  accept: string
  onFile: (file: File) => void
}

export function PhotoField({ name, label, hint, value, error, accept, onFile }: PhotoFieldProps) {
  const id = fieldId(name)
  const file = value instanceof File ? value : null
  const preview = useMemo(() => (file && file.type !== "image/heic" && file.type !== "image/heif" ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview])

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-navy">{label}</span>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-xl border border-dashed bg-paper p-4 transition-colors hover:border-royal hover:bg-royal/[0.03] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-royal",
          error ? "border-red-600/70" : "border-silver-dim",
        )}
      >
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-mist text-royal">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImageUp className="size-6" aria-hidden="true" />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-[0.9375rem] font-semibold text-navy">
            {file ? "Change photo" : value ? "Photo on file. Choose a new one to replace it" : "Choose a photo"}
          </span>
          <span className="truncate text-sm text-ink-muted">{file ? `${file.name} · ${(file.size / 1048576).toFixed(1)} MB` : hint}</span>
        </span>
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
          className="sr-only"
          onChange={(e) => {
            // Cancelling the picker keeps the current photo.
            const picked = e.target.files?.[0]
            if (picked) onFile(picked)
            e.target.value = ""
          }}
        />
      </label>
      <Message id={id} error={error} />
    </div>
  )
}
