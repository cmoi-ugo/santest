import { useCallback, useState } from 'react';

interface UseConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/**
 * Hook pour gérer les dialogues de confirmation de manière programmatique
 */
export function useConfirm(defaultOptions: UseConfirmOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmOptions>(defaultOptions);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (newOptions: UseConfirmOptions = {}): Promise<boolean> => {
      return new Promise((resolve) => {
        setOptions({ ...defaultOptions, ...newOptions });
        setResolveRef(() => resolve);
        setIsOpen(true);
      });
    },
    [defaultOptions]
  );

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) resolveRef(true);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) resolveRef(false);
  }, [resolveRef]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
}