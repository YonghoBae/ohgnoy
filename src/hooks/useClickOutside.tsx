import { RefObject, useEffect } from 'react'

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: PointerEvent) => void,
): void {
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (!ref || !ref.current || ref.current.contains(event.target as Node)) {
        return
      }

      handler(event)
    }

    document.addEventListener('pointerdown', handleClickOutside)

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [ref, handler])
}

export default useClickOutside
