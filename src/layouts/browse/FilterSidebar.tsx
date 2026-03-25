import React from 'react';
import styles from './FilterSidebar.module.css';

interface FilterSectionProps {
  label: string;
  children: React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ label, children }) => (
  <div className={styles.filterSection}>
    <h3 className={styles.filterLabel}>{label}</h3>
    {children}
  </div>
);

export const FilterRadioGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.radioGroup}>
    {children}
  </div>
);

interface FilterRadioOptionProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

export const FilterRadioOption: React.FC<FilterRadioOptionProps> = ({ 
  name, value, label, checked, onChange, icon 
}) => (
  <label className={`${styles.radioOption} ${checked ? styles.radioActive : ''}`}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className={styles.radioInput}
    />
    {icon && <span className={styles.filterIcon}>{icon}</span>}
    <span className={styles.filterText}>{label}</span>
    {checked && <span className={styles.activeDot} />}
  </label>
);

export const FilterSortList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.sortList}>
    {children}
  </div>
);

interface FilterSortOptionProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const FilterSortOption: React.FC<FilterSortOptionProps> = ({ 
  label, active, onClick, icon 
}) => (
  <button
    className={`${styles.sortOption} ${active ? styles.sortActive : ''}`}
    onClick={onClick}
  >
    {icon && <span className={styles.filterIcon}>{icon}</span>}
    <span className={styles.filterText}>{label}</span>
    {active && <span className={styles.activeDot} />}
  </button>
);

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({ label, checked, onChange, disabled }) => (
  <label className={`${styles.checkboxOption} ${disabled ? styles.checkboxDisabled : ''}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
    <span>{label}</span>
  </label>
);

interface FilterNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  placeholder?: string;
}

export const FilterNumberInput: React.FC<FilterNumberInputProps> = ({
  value, onChange, min = 0, max, step = 1, suffix, placeholder,
}) => (
  <div className={styles.numberInputWrap}>
    <input
      type="number"
      className={styles.numberInput}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
    />
    {suffix && <span className={styles.numberInputSuffix}>{suffix}</span>}
  </div>
);

export const FilterPlaceholder: React.FC<{ text: string }> = ({ text }) => (
  <p className={styles.filterHint}>{text}</p>
);

interface FilterTagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
  variant?: 'include' | 'exclude';
}

export const FilterTagInput: React.FC<FilterTagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  placeholder = 'Add tag…',
  variant = 'include',
}) => {
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commit = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onAdd(tag);
    }
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(value);
    }
    if (e.key === 'Backspace' && !value && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.includes(',')) {
      e.preventDefault();
      pasted.split(',').forEach((t) => commit(t));
    }
  };

  const isExclude = variant === 'exclude';

  return (
    <div
      className={styles.tagInputWrap}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.length > 0 && (
        <div className={styles.tagChips}>
          {tags.map((tag) => (
            <span
              key={tag}
              className={`${styles.tagChip} ${isExclude ? styles.tagChipExclude : ''}`}
            >
              <span className={styles.tagChipLabel}>{tag}</span>
              <button
                type="button"
                className={styles.tagChipRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(tag);
                }}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        className={styles.tagInput}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(',', ''))}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => { if (value.trim()) commit(value); }}
        placeholder={tags.length === 0 ? placeholder : ''}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
};

export const FilterSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
