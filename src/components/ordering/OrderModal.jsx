import { useMemo } from 'react'
import { buildWhatsAppLink } from '../../utils/whatsappUtils'

export default function OrderModal({ item, onClose }){
  const href = useMemo(()=>buildWhatsAppLink(item), [item])
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Order via WhatsApp</h3>
        <p className="text-sm text-neutral-700">We'll open WhatsApp with a pre-filled message including the cake name, category and price range. You can customize the message before sending.</p>
        <a className="px-4 py-2 rounded bg-whatsapp text-white inline-block" href={href} target="_blank" rel="noreferrer">Open WhatsApp</a>
        <button className="px-4 py-2 rounded border" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
