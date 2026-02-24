import { useState, useEffect } from 'react';

/**
 * Manages the common modal visibility + animation pattern.
 * 
 * Most modals in this app use a two-state pattern:
 * - `isOpen` (prop from parent) controls whether the modal should be visible
 * - `isVisible` (internal) delays the unmount to allow the CSS exit animation to play
 * 
 * Usage:
 * ```tsx
 * const MyModal = ({ isOpen, onClose }) => {
 *   const { isVisible } = useModalVisibility(isOpen);
 *   if (!isVisible && !isOpen) return null;
 *   ...
 * };
 * ```
 */
export function useModalVisibility(isOpen: boolean, exitDurationMs = 300) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), exitDurationMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, exitDurationMs]);

  return { isVisible };
}
