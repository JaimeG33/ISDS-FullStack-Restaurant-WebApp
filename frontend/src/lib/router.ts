// Tiny hash router (#/menu, #/staff/orders …) so the prototype needs no extra dependency
// and works on any static host. Swap for react-router later if the team wants.
import { useEffect, useState } from 'react'

const current = () => window.location.hash.replace(/^#/, '') || '/'

export function navigate(path: string) {
  if (current() === path) return
  window.location.hash = path
}

export function useRoute() {
  const [path, setPath] = useState(current)
  useEffect(() => {
    const onChange = () => {
      setPath(current())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}
