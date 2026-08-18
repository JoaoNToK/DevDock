'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditing =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      // Open Keyboard Shortcuts Help Modal on "?" (Shift + / or ?) when not editing text
      if (!isEditing && e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // Alt + Number Navigation Shortcuts
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            router.push('/');
            break;
          case '2':
            e.preventDefault();
            router.push('/pomodoro');
            break;
          case '3':
            e.preventDefault();
            router.push('/projetos');
            break;
          case '4':
            e.preventDefault();
            router.push('/estudos/faculdade');
            break;
          case '5':
            e.preventDefault();
            router.push('/calendario');
            break;
          case '6':
            e.preventDefault();
            router.push('/configuracoes');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return {
    isHelpOpen,
    openHelp,
    closeHelp,
  };
}
