import React, { useRef, useEffect } from 'react';

interface OtpVerificationInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  isError?: boolean;
  autoFocus?: boolean;
}

export const OtpVerificationInput: React.FC<OtpVerificationInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  isError = false,
  autoFocus = true,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawChar = e.target.value.replace(/\D/g, '');
    const char = rawChar.slice(-1); // Take latest typed digit

    const newDigits = [...digits];
    newDigits[index] = char;
    const nextVal = newDigits.join('').slice(0, 6);
    onChange(nextVal);

    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (nextVal.length === 6 && onComplete) {
      onComplete(nextVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    onChange(pastedData);
    const targetIdx = Math.min(pastedData.length, 5);
    inputsRef.current[targetIdx]?.focus();

    if (pastedData.length === 6 && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div
      role="group"
      aria-label="Código de verificación de 6 dígitos"
      className="flex items-center justify-center gap-2 sm:gap-3"
    >
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          aria-label={`Dígito ${idx + 1} de 6`}
          value={digits[idx] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-xl transition-all duration-200 outline-none select-none ${
            isError
              ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-500 focus:ring-4 focus:ring-rose-500/20'
              : digits[idx]
              ? 'border-2 border-primary bg-primary/10 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(230,81,0,0.25)] focus:ring-4 focus:ring-primary/20'
              : 'border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-gray-600 focus:border-primary focus:ring-4 focus:ring-primary/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
        />
      ))}
    </div>
  );
};
