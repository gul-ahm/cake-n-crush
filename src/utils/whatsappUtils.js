function encodeMessage(lines) {
  return encodeURIComponent(lines.join('\n'))
}

export function buildWhatsAppLink(item, phoneNumber) {
  const number = (phoneNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '+910000000000').replace(/[^\d+]/g, '')
  const lines = [
    '          Cake N Crush Order Inquiry!',
    '',
    `Cake: ${item?.name || 'N/A'}`,
    `Price Range: ${item?.priceRange || 'N/A'}`,
    `Category: ${item?.category || 'N/A'}`,
    `Image Reference: ${item?.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : window.location.origin + item.images[0]) : (item?.url || 'N/A')}`,
    '',
    "I'm interested in ordering this cake. Could you please provide:",
    '             Available delivery dates',
    '     Customization options',
    '   Final pricing details',
    '    Delivery location options',
    '',
    'Looking forward to hearing from you!'
  ]
  const text = encodeMessage(lines)
  return `https://wa.me/${number}?text=${text}`
}
