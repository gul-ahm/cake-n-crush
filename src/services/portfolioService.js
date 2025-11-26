import { supabase } from './supabaseClient'
import { log as logActivity } from './activityService'

// Helper: Upload file to Supabase Storage
const uploadImage = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Image upload failed:', error)
    return null
  }
}

export const getAll = async () => {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return []
  }
}

export const add = async (entry) => {
  // Upload images first
  const imageUrls = []
  if (entry.images && entry.images.length > 0) {
    for (const file of entry.images) {
      const url = await uploadImage(file)
      if (url) imageUrls.push(url)
    }
  }

  const newItem = {
    name: entry.name,
    description: entry.description,
    category: entry.category,
    price_range: entry.priceRange, // Note: camelCase to snake_case mapping might be needed if DB uses snake_case
    images: imageUrls,
    views: 0
  }

  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert([newItem])
      .select()

    if (error) throw error

    logActivity('portfolio_add', { name: entry.name, category: entry.category })
    return data[0]
  } catch (error) {
    console.error('Error adding item:', error)
    return null
  }
}

export const update = async (id, patch) => {
  const updateData = { ...patch }

  // Handle image updates
  if (patch.images && patch.images.length > 0) {
    const imageUrls = []
    for (const file of patch.images) {
      // Check if it's already a URL (existing image) or a File (new upload)
      if (typeof file === 'string') {
        imageUrls.push(file)
      } else {
        const url = await uploadImage(file)
        if (url) imageUrls.push(url)
      }
    }
    updateData.images = imageUrls
  }

  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    logActivity('portfolio_update', { id })
    return data[0]
  } catch (error) {
    console.error('Error updating item:', error)
    return null
  }
}

export const remove = async (id) => {
  try {
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)

    if (error) throw error

    logActivity('portfolio_remove', { id })
    return true
  } catch (error) {
    console.error('Error removing item:', error)
    return false
  }
}

export const reorder = async (sourceIndex, destIndex) => {
  console.warn('Reordering not yet implemented for Supabase backend')
  return await getAll()
}

export const findById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error finding item:', error)
    return null
  }
}
