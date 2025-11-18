// Convert an image File/Blob to WebP data URL (client-side)
export async function toWebP(file, quality = 0.9) {
  try {
    const bitmap = await createImageBitmap(file)

    // Prefer OffscreenCanvas when available for performance
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(bitmap, 0, 0)
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality })
      const buf = await blob.arrayBuffer()
      const b64 = arrayBufferToBase64(buf)
      return `data:${blob.type};base64,${b64}`
    }

    // Fallback to HTMLCanvasElement in windowed environments
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0)
    const dataUrl = canvas.toDataURL('image/webp', quality)
    return dataUrl || await readAsDataURL(file)
  } catch {
    // Final fallback: return original as data URL
    return await readAsDataURL(file)
  }
}

function arrayBufferToBase64(buffer){
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function readAsDataURL(file){
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = reject
    fr.readAsDataURL(file)
  })
}
 
