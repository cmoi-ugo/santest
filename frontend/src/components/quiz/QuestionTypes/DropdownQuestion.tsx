import React from 'react';
import { QuestionOption } from '@/features/quiz/types/question.types';
import styles from './QuestionTypes.module.css';

interface DropdownQuestionProps {
  questionId: number;
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
}

export const DropdownQuestion: React.FC<DropdownQuestionProps> = ({
  questionId,
  options,
  value,
  onChange
}) => {
  return (
    <select
      className={styles.dropdown}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      id={`question_${questionId}`}
    >
      <option value="">Sélectionner une option</option>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};