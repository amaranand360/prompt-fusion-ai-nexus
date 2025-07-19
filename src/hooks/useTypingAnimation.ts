import { useState, useEffect } from 'react';

interface UseTypingAnimationOptions {
  text: string;
  speed?: number;
  delay?: number;
  enabled?: boolean;
}

export const useTypingAnimation = ({ 
  text, 
  speed = 30, 
  delay = 0, 
  enabled = true 
}: UseTypingAnimationOptions) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);

    const startTyping = () => {
      let currentIndex = 0;
      
      const typeNextCharacter = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeNextCharacter, speed);
        } else {
          setIsComplete(true);
        }
      };

      typeNextCharacter();
    };

    const timer = setTimeout(startTyping, delay);
    return () => clearTimeout(timer);
  }, [text, speed, delay, enabled]);

  return { displayedText, isComplete };
};

interface UseMultiFieldTypingOptions {
  fields: Record<string, string>;
  speed?: number;
  fieldDelay?: number;
  enabled?: boolean;
}

export const useMultiFieldTyping = ({ 
  fields, 
  speed = 30, 
  fieldDelay = 500, 
  enabled = true 
}: UseMultiFieldTypingOptions) => {
  const [animatedFields, setAnimatedFields] = useState<Record<string, string>>({});
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setAnimatedFields(fields);
      setIsComplete(true);
      return;
    }

    setAnimatedFields({});
    setIsComplete(false);
    setCurrentField(null);

    const fieldKeys = Object.keys(fields);
    let currentFieldIndex = 0;

    const animateNextField = () => {
      if (currentFieldIndex >= fieldKeys.length) {
        setIsComplete(true);
        setCurrentField(null);
        return;
      }

      const fieldKey = fieldKeys[currentFieldIndex];
      const fieldText = fields[fieldKey];
      setCurrentField(fieldKey);

      let currentIndex = 0;
      
      const typeNextCharacter = () => {
        if (currentIndex < fieldText.length) {
          setAnimatedFields(prev => ({
            ...prev,
            [fieldKey]: fieldText.slice(0, currentIndex + 1)
          }));
          currentIndex++;
          setTimeout(typeNextCharacter, speed);
        } else {
          // Field complete, move to next after delay
          currentFieldIndex++;
          setTimeout(animateNextField, fieldDelay);
        }
      };

      typeNextCharacter();
    };

    // Start animation after initial delay
    const timer = setTimeout(animateNextField, 300);
    return () => clearTimeout(timer);
  }, [fields, speed, fieldDelay, enabled]);

  return { animatedFields, currentField, isComplete };
};

// Hook for cursor blinking state
export const useTypingCursor = (show: boolean) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }

    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [show]);

  return visible;
};
