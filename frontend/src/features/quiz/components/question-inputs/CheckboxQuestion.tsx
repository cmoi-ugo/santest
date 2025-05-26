import React from 'react';
import { QuestionOption } from '@/features/quiz/types/question.types';
import styles from './QuestionTypes.module.css';

interface CheckboxQuestionProps {
  questionId: number;
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

export const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({
  options,
  value = [],
  onChange
}) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    
    if (checked) {
      onChange([...currentValues, optionValue]);
    } else {
      onChange(currentValues.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={styles.optionsContainer}>
      {options?.map((option) => (
        <label key={option.value} className={styles.checkboxLabel}>
          <input
            type="checkbox"
            value={option.value}
            checked={Array.isArray(value) && value.includes(option.value)}
            onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};