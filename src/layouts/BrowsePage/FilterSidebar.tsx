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
  disabled?: boolean;
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({ label, disabled }) => (
  <label className={styles.checkboxOption}>
    <input type="checkbox" disabled={disabled} />
    <span>{label}</span>
  </label>
);

export const FilterPlaceholder: React.FC<{ text: string }> = ({ text }) => (
  <p className={styles.filterHint}>{text}</p>
);

export const FilterSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
