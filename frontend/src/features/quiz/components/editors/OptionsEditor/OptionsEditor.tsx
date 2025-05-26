import React from 'react';
import { QuestionOption } from '@/features/quiz/types/question.types';
import { MdAdd, MdDelete } from 'react-icons/md';
import { UI } from '@/config';
import styles from '@/features/quiz/components/editors/QuestionEditor/QuestionEditor.module.css';

interface OptionsEditorProps {
  options: QuestionOption[];
  onOptionChange: (index: number, field: 'label' | 'value', value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({
  options,
  onOptionChange,
  onAddOption,
  onRemoveOption
}) => {
  return (
    <div className={styles.optionsEditor}>
      <h4>Options</h4>
      {options.map((option, index) => (
        <div key={index} className={styles.optionRow}>
          <input
            type="text"
            value={option.label}
            onChange={(e) => onOptionChange(index, 'label', e.target.value)}
            placeholder="Label de l'option"
          />
          <button
            type="button"
            onClick={() => onRemoveOption(index)}
            className={styles.removeButton}
          >
            <MdDelete size={UI.ICONS.SIZE.MEDIUM} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAddOption}
        className={styles.addButton}
      >
        <MdAdd size={UI.ICONS.SIZE.SMALL} /> Ajouter une option
      </button>
    </div>
  );
};