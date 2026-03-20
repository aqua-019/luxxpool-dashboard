import { useState, useCallback } from 'react';

export function useCopy() {
  const [copied, setCopied] = useState('');
  const copy = useCallback((value) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(value);
    setTimeout(() => setCopied(''), 1500);
  }, []);
  return [copied, copy];
}
