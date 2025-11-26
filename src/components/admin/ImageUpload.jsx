import { useState } from 'react'

export default function ImageUpload({ categories, onSave, onClose }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [priceRange, setPriceRange] = useState('₹1000 - ₹3000')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])

  const onDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }
  const handleFiles = (fileList) => {
    const arr = Array.from(fileList).filter(f => /\.(jpe?g|png|webp)$/i.test(f.name) && f.size <= 10 * 1024 * 1024)
    setFiles(prev => [...prev, ...arr])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    await onSave({ name, category, priceRange, description, images: files })
    try {
      const mod = await import('canvas-confetti')
      const confetti = mod.default || mod
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.25 },
        scalar: 0.9,
      })
      setTimeout(() => confetti({ particleCount: 80, spread: 100, startVelocity: 40, origin: { y: 0.1 } }), 180)
    } catch { }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <h3 className="text-lg font-semibold">Upload New Cake</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <input
              list="category-options"
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Select or type new..."
            />
            <datalist id="category-options">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm mb-1">Price Range</label>
            <input className="w-full border rounded px-3 py-2" value={priceRange} onChange={e => setPriceRange(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="border-dashed border-2 rounded p-6 text-center text-sm text-neutral-600">
          <p>Drag and drop images here (JPG, PNG, WebP, max 10MB each)</p>
          <div className="mt-3">
            <input type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} />
          </div>
          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded border group">
                  <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-black text-white" onClick={save} disabled={!name || files.length === 0}>Save</button>
        </div>
      </div>
    </div>
  )
}
