import { useTranslation } from '@/hooks/useTranslation';
import React from 'react';
import { QuestionOption } from '@/features/quiz/types/question.types';

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
  const { t } = useTranslation();
  
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      id={`question_${questionId}`}
    >
      <option value="">{t('questions.form.selectOption')}</option>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};