import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink } from '../src/utils/whatsappUtils'

describe('buildWhatsAppLink', () => {
  it('builds a wa.me link with default number and encoded message', () => {
    const link = buildWhatsAppLink({ name: 'Chocolate Truffle', category: 'Birthday', priceRange: '₹1000 - ₹3000' })
    expect(link.startsWith('https://wa.me/')).toBe(true)
    expect(link).toContain('text=')
    expect(decodeURIComponent(link)).toContain('Chocolate Truffle')
    expect(decodeURIComponent(link)).toContain('Birthday')
  })
})
