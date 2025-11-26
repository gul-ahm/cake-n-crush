const API_BASE = '/api/content'
const UPLOAD_API = '/api/upload'

// Helper: Upload file to server
export const uploadFile = async (file) => {
    try {
        const formData = new FormData()
        formData.append('image', file)

        const res = await fetch(UPLOAD_API, {
            method: 'POST',
            body: formData
        })

        if (!res.ok) throw new Error('Upload failed')

        const data = await res.json()
        return data.url
    } catch (error) {
        console.error('File upload failed:', error)
        return null
    }
}

export const getContent = async (type) => {
    try {
        const res = await fetch(`${API_BASE}/${type}`)
        if (!res.ok) throw new Error(`Fetch failed for ${type}`)
        return await res.json()
    } catch (error) {
        console.error(`Error fetching ${type}:`, error)
        return null
    }
}

export const saveContent = async (type, data) => {
    try {
        const res = await fetch(`${API_BASE}/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!res.ok) throw new Error(`Save failed for ${type}`)
        return await res.json()
    } catch (error) {
        console.error(`Error saving ${type}:`, error)
        return null
    }
}
