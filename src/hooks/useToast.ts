import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  visible: boolean;
  type: 'success' | 'info' | 'error';
}

export default function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    visible: false,
    type: 'info',
  });

  const showToast = useCallback((
    message: string,
    type: 'success' | 'info' | 'error' = 'info'
  ) => {
    setToast({ message, visible: true, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
}