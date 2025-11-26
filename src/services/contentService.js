import { supabase } from './supabaseClient'

// Helper: Upload file to Supabase Storage
export const uploadFile = async (file) => {
    try {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const { data, error } = await supabase.storage
            .from('portfolio-images') // Reusing the same bucket for simplicity
            .upload(fileName, file)

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(fileName)

        return publicUrl
    } catch (error) {
        console.error('File upload failed:', error)
        return null
    }
}

export const getContent = async (type) => {
    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('value')
            .eq('key', type)
            .single()

        if (error) {
            // If not found, return null (or default)
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data.value
    } catch (error) {
        console.error(`Error fetching ${type}:`, error)
        return null
    }
}

export const saveContent = async (type, data) => {
    try {
        const { error } = await supabase
            .from('site_content')
            .upsert({ key: type, value: data })

        if (error) throw error
        return data
    } catch (error) {
        console.error(`Error saving ${type}:`, error)
        return null
    }
}
