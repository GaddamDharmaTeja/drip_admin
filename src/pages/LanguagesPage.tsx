import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import defaultEnglish from '../../../dripgrow/src/i18n/locales/en.json'
import defaultTelugu from '../../../dripgrow/src/i18n/locales/te.json'

type Language = 'en' | 'te'

const labels: Record<Language, string> = { en: 'English (en)', te: 'Telugu (te)' }
const defaults: Record<Language, Record<string, unknown>> = { en: defaultEnglish, te: defaultTelugu }

export function LanguagesPage() {
  const [language, setLanguage] = useState<Language>('te')
  const [translations, setTranslations] = useState<Record<string, unknown>>({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load(selected: Language) {
    setBusy(true)
    setMessage('')
    try {
      const published = await api.locale(selected)
      setTranslations(Object.keys(published).length ? published : defaults[selected])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not load the language file.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { void load(language) }, [language])

  function download() {
    const file = new Blob([JSON.stringify(translations, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `dripgrow-${language}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function upload(file?: File) {
    if (!file) return
    setMessage('')
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Choose a JSON file whose root value is an object.')
      }
      setBusy(true)
      const saved = await api.saveLocale(language, parsed as Record<string, unknown>)
      setTranslations(saved)
      setMessage(`Published ${labels[language]}. Storefront visitors receive it on their next refresh.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not upload the language file.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-leaf">Localization</p>
      <h1 className="mt-1 font-display text-4xl text-forest">Language files</h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        Download a language JSON file, edit its text values, then upload it to publish the changes. Use the same nested key structure; prices, IDs, and other business data are not part of these files.
      </p>

      <div className="mt-8 rounded-2xl border border-leaf/10 bg-white p-6 shadow-sm">
        <label className="label" htmlFor="language">Language</label>
        <select id="language" className="input max-w-xs" value={language} onChange={(e) => setLanguage(e.target.value as Language)} disabled={busy}>
          <option value="en">{labels.en}</option>
          <option value="te">{labels.te}</option>
        </select>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-outline" onClick={download} disabled={busy}>
            Download current JSON
          </button>
          <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? 'Working…' : 'Upload and publish JSON'}
          </button>
          <input ref={inputRef} className="hidden" type="file" accept="application/json,.json" onChange={(e) => void upload(e.target.files?.[0])} />
        </div>

        {message && <p className="mt-5 rounded-lg bg-mist px-4 py-3 text-sm text-forest">{message}</p>}
        <p className="mt-6 text-xs text-stone-500">
          {Object.keys(translations).length} top-level translation groups loaded. If no file has been published, the bundled default is shown and can be downloaded as a starting point.
        </p>
      </div>
    </section>
  )
}
