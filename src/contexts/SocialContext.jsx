import { createContext, useContext, useState, useEffect } from 'react'
import { getContent } from '../services/contentService'

const SocialContext = createContext()

export function SocialProvider({ children }) {
    const [socials, setSocials] = useState({
        main: { whatsapp: '' },
        custom: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getContent('social')
                if (data) {
                    setSocials(data)
                }
            } catch (error) {
                console.error('Failed to load social links:', error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <SocialContext.Provider value={{ socials, loading }}>
            {children}
        </SocialContext.Provider>
    )
}

export function useSocial() {
    return useContext(SocialContext)
}
