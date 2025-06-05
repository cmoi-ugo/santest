import React from 'react';

import { useTranslation } from '@/hooks';

import type { QuestionOption } from '../../types/question.types';

interface DropdownQuestionProps {
  questionId: number;
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Composant pour les questions de type dropdown/select
 */
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