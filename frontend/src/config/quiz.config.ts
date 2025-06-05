import { LinearScaleOptions, QuestionOption } from '@/features/quiz/types/question.types';

/**
 * Configuration par défaut pour les questions de quiz
 */
export const DEFAULT_OPTIONS: QuestionOption[] = [
  { label: '', value: 'option_1' },
  { label: '', value: 'option_2' }
];

export const DEFAULT_SCALE_OPTIONS: LinearScaleOptions = {
  min_value: 1,
  max_value: 5,
  min_label: '',
  max_label: ''
};