import { useCallback, useState } from 'react';

/**
 * Stato condiviso del FAB "Torna su" (vedi `ScrollToTopFab`): mostra il
 * bottone quando la lista scorre oltre 300px. Il `scrollToTop` resta al
 * chiamante (ogni lista ha il proprio ref/metodo di scroll).
 */
export function useScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback((event: any) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 300);
  }, []);

  return { showScrollTop, handleScroll };
}
