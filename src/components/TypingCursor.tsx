import React from 'react';
import { useTypingCursor } from '@/hooks/useTypingAnimation';

interface TypingCursorProps {
  show: boolean;
}

export const TypingCursor: React.FC<TypingCursorProps> = ({ show }) => {
  const visible = useTypingCursor(show);

  return (
    <span className={`inline-block w-0.5 h-4 bg-current ml-1 transition-opacity duration-150 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`} />
  );
};
