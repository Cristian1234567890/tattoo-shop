import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  flag?: string;
  code?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
  ariaLabel?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  className = '',
  label,
  id: externalId,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const selectId = externalId || autoId;

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex !== -1 ? options[selectedIndex] : null;

  const [focusedIndex, setFocusedIndex] = useState<number>(
    selectedIndex !== -1 ? selectedIndex : 0
  );

  // Sync focused index when value or options change
  useEffect(() => {
    if (selectedIndex !== -1) {
      setFocusedIndex(selectedIndex);
    }
  }, [selectedIndex]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const activeElement = listboxRef.current.children[focusedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  // Comprehensive WCAG 2.1 AA Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === 'Home' && isOpen) {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === 'End' && isOpen) {
      e.preventDefault();
      setFocusedIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) {
        if (options[focusedIndex]) {
          onChange(options[focusedIndex].value);
        }
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    } else if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={`${selectId}-trigger`} className="block text-sm font-medium text-slate-800 dark:text-white mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button with full ARIA semantics */}
      <button
        id={`${selectId}-trigger`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        aria-controls={isOpen ? `${selectId}-listbox` : undefined}
        aria-activedescendant={isOpen && options[focusedIndex] ? `${selectId}-opt-${focusedIndex}` : undefined}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#121217] border rounded-xl text-left transition-all duration-200 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0c10] shadow-sm ${
          isOpen
            ? 'border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-violet-500'
            : 'border-slate-300 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 focus:border-violet-500'
        }`}
      >
        <span className="flex items-center gap-3 text-sm truncate">
          {selectedOption ? (
            <>
              {selectedOption.flag && <span className="text-base shrink-0" aria-hidden="true">{selectedOption.flag}</span>}
              <span className="text-slate-900 dark:text-white font-medium">{selectedOption.label}</span>
              {selectedOption.code && <span className="text-xs text-slate-500 dark:text-zinc-500 uppercase">({selectedOption.code})</span>}
            </>
          ) : (
            <span className="text-slate-400 dark:text-zinc-500">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 text-slate-500 dark:text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-violet-600 dark:text-violet-400' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Listbox */}
      {isOpen && (
        <div
          id={`${selectId}-listbox`}
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel || label || placeholder}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-[#121217] border border-slate-200 dark:border-zinc-800/90 rounded-2xl shadow-xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = index === focusedIndex;

            return (
              <div
                id={`${selectId}-opt-${index}`}
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-violet-50 dark:bg-violet-600/20 text-violet-700 dark:text-violet-300 font-semibold'
                    : isFocused
                    ? 'bg-slate-100 dark:bg-zinc-800/80 text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  {option.flag && <span className="text-base shrink-0" aria-hidden="true">{option.flag}</span>}
                  <span className="truncate">{option.label}</span>
                  {option.code && <span className="text-[11px] text-slate-500 dark:text-zinc-500 uppercase">({option.code})</span>}
                </div>

                {isSelected && <Check aria-hidden="true" className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
