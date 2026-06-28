import { useEffect } from 'react';

interface LoaderProps {
  title?: string;
  brandText?: string;
  duration?: number;
  onComplete?: () => void;
}

export function OBYSLoader({ onComplete }: LoaderProps) {
  useEffect(() => {
    // Immediately tell the parent component that the "loading" is done
    onComplete?.();
  }, [onComplete]);

  // Render absolutely nothing to the screen
  return null;
}