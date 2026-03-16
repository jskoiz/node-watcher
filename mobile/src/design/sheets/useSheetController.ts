import { useCallback, useRef, useState } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export function useSheetController() {
  const ref = useRef<BottomSheetModal | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    ref.current?.dismiss();
    setVisible(false);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    ref,
    visible,
    open,
    close,
    handleDismiss,
  };
}
