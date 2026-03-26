import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SwipeDeckUser } from './swipeDeck.types';

interface UseSwipeDeckControllerOptions {
  data: SwipeDeckUser[];
  onSwipeLeft: (user: SwipeDeckUser) => void;
  onSwipeRight: (user: SwipeDeckUser) => void;
}

export function useSwipeDeckController({
  data,
  onSwipeLeft,
  onSwipeRight,
}: UseSwipeDeckControllerOptions) {
  const [allSwiped, setAllSwiped] = useState(false);
  const swipingRef = useRef(false);
  const feedSignatureRef = useRef('');

  const dataSignature = useMemo(() => data.map((user) => user.id).join('|'), [data]);

  const handleSwipedLeft = useCallback(
    (index: number) => {
      if (swipingRef.current) return;
      swipingRef.current = true;
      onSwipeLeft(data[index]);
      requestAnimationFrame(() => {
        swipingRef.current = false;
      });
    },
    [data, onSwipeLeft],
  );

  const handleSwipedRight = useCallback(
    (index: number) => {
      if (swipingRef.current) return;
      swipingRef.current = true;
      onSwipeRight(data[index]);
      requestAnimationFrame(() => {
        swipingRef.current = false;
      });
    },
    [data, onSwipeRight],
  );

  useEffect(() => {
    if (dataSignature && feedSignatureRef.current !== dataSignature) {
      setAllSwiped(false);
    }
    feedSignatureRef.current = dataSignature;
  }, [dataSignature]);

  const handleSwipedAll = useCallback(() => {
    setAllSwiped(true);
  }, []);

  return {
    allSwiped,
    handleSwipedAll,
    handleSwipedLeft,
    handleSwipedRight,
  };
}
