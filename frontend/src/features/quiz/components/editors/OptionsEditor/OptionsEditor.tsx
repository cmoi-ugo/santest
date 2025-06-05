import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

import { Button } from '@/components/ui';
import { UI } from '@/config';
import { useTranslation } from '@/hooks';

import type { QuestionOption } from '../../../types/question.types';
import styles from '../QuestionEditor/QuestionEditor.module.css';

interface OptionsEditorProps {
  options: QuestionOption[];
  onOptionChange: (index: number, field: 'label' | 'value', value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

/**
 * Éditeur d'options pour les questions à choix multiples et dropdown
 */
export const OptionsEditor: React.FC<OptionsEditorProps> = ({
  options,
  onOptionChange,
  onAddOption,
  onRemoveOption
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.optionsEditor}>
      <h4>{t('quiz.form.options')}</h4>
      {options.map((option, index) => (
        <div key={index} className={styles.optionRow}>
          <input
            type="text"
            value={option.label}
            onChange={(e) => onOptionChange(index, 'label', e.target.value)}
            placeholder={t('quiz.form.optionLabel')}
            className={styles.optionInput}
          />
          <Button
            variant="text"
            size="small"
            onClick={() => onRemoveOption(index)}
            icon={<MdDelete size={UI.ICONS.SIZE.MEDIUM} />}
            title={t('quiz.form.removeOption')}
            className={styles.removeButton}
          />
        </div>
      ))}
      <Button
        variant="text"
        onClick={onAddOption}
        icon={<MdAdd size={UI.ICONS.SIZE.SMALL} />}
        className={styles.addButton}
      >
        {t('quiz.form.addOption')}
      </Button>
    </div>
  );
};