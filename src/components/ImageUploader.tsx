import { useRef, useState } from 'react'
import { fileUrl, uploadImage } from '../lib/api'

type Props = {
  label?: string
  value?: string
  onChange: (url: string) => void
  hint?: string
}

export function ImageUploader({
  label = 'Image',
  value,
  onChange,
  hint = 'JPEG, PNG, WebP or GIF · max 8 MB · stored in MongoDB GridFS',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const preview = fileUrl(value)

  async function onFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadImage(file)
      onChange(result.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <p className="label">{label}</p>
      <div
        className={`upload-zone ${uploading ? 'opacity-70' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          void onFile(e.dataTransfer.files?.[0])
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        {preview ? (
          <img src={preview} alt="" className="upload-preview" />
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold text-forest">
              {uploading ? 'Uploading to database…' : 'Drop image or click to upload'}
            </p>
            <p className="mt-1 text-xs text-stone-500">{hint}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {preview && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="btn-outline flex-1"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Replace
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onChange('')}
            disabled={uploading}
          >
            Remove
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  )
}
