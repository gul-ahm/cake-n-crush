import { useMemo } from 'react'
import { buildWhatsAppLink } from '../utils/whatsappUtils'

export default function useWhatsAppOrder(item){
  const href = useMemo(()=>buildWhatsAppLink(item), [item])
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || '+910000000000'
  return { href, number }
}
