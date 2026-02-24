import { useEffect, RefObject } from 'react';

/**
 * Calls the handler when a click occurs outside the referenced element.
 * 
 * Common pattern used in GlassDropdown and GlassDatePicker to close
 * popovers/menus when the user clicks elsewhere.
 * 
 * Usage:
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false));
 * ```
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler, enabled]);
}
