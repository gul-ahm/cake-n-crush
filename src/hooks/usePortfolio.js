import { useEffect, useMemo, useState } from 'react'
import * as portfolioService from '../services/portfolioService'

export default function usePortfolio() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setItems(portfolioService.getAll())
    setLoading(false)
  }, [])

  const add = async (entry) => {
    const saved = await portfolioService.add(entry)
    setItems(saved)
  }

  const update = async (id, patch) => {
    const saved = await portfolioService.update(id, patch)
    setItems(saved)
  }

  const remove = async (id) => {
    const saved = await portfolioService.remove(id)
    setItems(saved)
  }

  const reorder = async (sourceIndex, destIndex) => {
    const saved = await portfolioService.reorder(sourceIndex, destIndex)
    setItems(saved)
  }

  const categories = useMemo(() => ['Birthday','Wedding','Custom','Seasonal'], [])

  return { items, loading, add, update, remove, reorder, categories }
}
