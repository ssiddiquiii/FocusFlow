import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export default function Dialog({
  isOpen,
  onClose,
  titleId,
  children,
  className = '',
  placement = 'center',
  closeOnBackdrop = true,
  closeOnEscape = true,
  returnFocusRef
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const returnFocusTarget = returnFocusRef?.current ?? previouslyFocused;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirstElement = () => {
      const autofocusTarget = panelRef.current?.querySelector('[autofocus]')
        ?? panelRef.current?.querySelector(FOCUSABLE_SELECTOR);
      (autofocusTarget ?? panelRef.current)?.focus();
    };
    const animationFrame = requestAnimationFrame(focusFirstElement);

    function handleKeyDown(event) {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...(panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])];
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.body.style.overflow = previousOverflow;
      returnFocusTarget?.focus?.();
    };
  }, [isOpen, onClose, closeOnEscape, returnFocusRef]);

  if (!isOpen) return null;

  const placementClasses = placement === 'top'
    ? 'items-start justify-center pt-[max(4rem,env(safe-area-inset-top))] sm:pt-24'
    : 'items-center justify-center';

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex bg-black/80 p-4 backdrop-blur-md ${placementClasses}`}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={className}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
