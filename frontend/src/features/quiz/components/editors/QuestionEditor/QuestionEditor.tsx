import { useEffect, useState } from 'react';

import { Button, FormField, ImageUrlField, useImageUrlField } from '@/components/ui';
import { DEFAULT_OPTIONS, DEFAULT_SCALE_OPTIONS } from '@/config';
import { useTranslation } from '@/hooks';

import { 
  Question, 
  QuestionType, 
  QuestionOption, 
  LinearScaleOptions 
} from '../../../types/question.types';
import { OptionsEditor } from '../OptionsEditor/OptionsEditor';
import { ScaleOptionsEditor } from '../ScaleOptionsEditor/ScaleOptionsEditor';
import styles from './QuestionEditor.module.css';

interface QuestionEditorProps {
  quizId: number;
  question?: Question | null;
  onSave: (question: Partial<Question>) => void;
  onCancel: () => void;
  inline?: boolean;
}

interface QuestionFormData {
  text: string;
  questionType: QuestionType;
  required: boolean;
  options?: QuestionOption[] | LinearScaleOptions;
}

/**
 * Retourne les options par défaut selon le type de question
 */
const getDefaultOptionsForType = (type: QuestionType): QuestionOption[] | LinearScaleOptions | undefined => {
  switch (type) {
    case QuestionType.LINEAR_SCALE:
      return DEFAULT_SCALE_OPTIONS;
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.CHECKBOX:
    case QuestionType.DROPDOWN:
      return DEFAULT_OPTIONS;
    case QuestionType.TEXT:
    default:
      return undefined;
  }
};

/**
 * Détermine si les options doivent être réinitialisées lors du changement de type
 */
const shouldResetOptions = (oldType: QuestionType, newType: QuestionType): boolean => {
  const arrayOptionsTypes = [
    QuestionType.MULTIPLE_CHOICE, 
    QuestionType.CHECKBOX, 
    QuestionType.DROPDOWN
  ];
  
  const oldHasArrayOptions = arrayOptionsTypes.includes(oldType);
  const newHasArrayOptions = arrayOptionsTypes.includes(newType);
  
  return oldHasArrayOptions !== newHasArrayOptions || 
    oldType === QuestionType.LINEAR_SCALE || 
    newType === QuestionType.LINEAR_SCALE;
};

/**
 * Éditeur de questions avec support de tous les types et validation
 */
export const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  quizId,
  question, 
  onSave, 
  onCancel,
  inline = false
}) => {
  const { t } = useTranslation();
  const imageUrl = useImageUrlField(question?.image_url || '');
  
  const [formData, setFormData] = useState<QuestionFormData>(() => ({
    text: question?.text || '',
    questionType: question?.question_type || QuestionType.MULTIPLE_CHOICE,
    required: question?.required || false,
    options: question?.options || getDefaultOptionsForType(question?.question_type || QuestionType.MULTIPLE_CHOICE)
  }));

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        questionType: question.question_type,
        required: question.required,
        options: question.options || getDefaultOptionsForType(question.question_type)
      });
      imageUrl.setValue(question.image_url || '');
    } else {
      setFormData({
        text: '',
        questionType: QuestionType.MULTIPLE_CHOICE,
        required: false,
        options: DEFAULT_OPTIONS
      });
      imageUrl.setValue('');
    }
  }, [question?.id]);

  const updateFormField = <K extends keyof QuestionFormData>(
    field: K, 
    value: QuestionFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionTypeChange = (newType: QuestionType) => {
    setFormData(prev => ({
      ...prev,
      questionType: newType,
      options: shouldResetOptions(prev.questionType, newType) 
        ? getDefaultOptionsForType(newType) 
        : prev.options
    }));
  };

  const handleAddOption = () => {
    if (!Array.isArray(formData.options)) return;
    
    const newOptions = [...formData.options];
    newOptions.push({ 
      label: '', 
      value: `option_${newOptions.length + 1}` 
    });
    updateFormField('options', newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (!Array.isArray(formData.options)) return;
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    updateFormField('options', newOptions);
  };

  const handleOptionChange = (index: number, field: 'label' | 'value', value: string) => {
    if (!Array.isArray(formData.options)) return;
    
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateFormField('options', newOptions);
  };

  const handleScaleOptionChange = (field: keyof LinearScaleOptions, value: any) => {
    if (formData.questionType !== QuestionType.LINEAR_SCALE || !formData.options) return;
    
    updateFormField('options', {
      ...formData.options as LinearScaleOptions, 
      [field]: value
    });
  };

  const handleSave = () => {
    if (!canSave) return;
    
    const questionData: Partial<Question> = {
      quiz_id: quizId,
      text: formData.text.trim(),
      question_type: formData.questionType,
      required: formData.required,
      image_url: imageUrl.getCleanUrl(),
      options: formData.options,
      ...(question && { id: question.id })
    };

    onSave(questionData);
  };

  const renderOptionsEditor = () => {
    switch (formData.questionType) {
      case QuestionType.LINEAR_SCALE:
        return (
          <ScaleOptionsEditor
            options={formData.options as LinearScaleOptions}
            onOptionChange={handleScaleOptionChange}
          />
        );
        
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.CHECKBOX:
      case QuestionType.DROPDOWN:
        return (
          <OptionsEditor
            options={formData.options as QuestionOption[]}
            onOptionChange={handleOptionChange}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
          />
        );
        
      case QuestionType.TEXT:
      default:
        return null;
    }
  };

  const containerClassName = inline 
    ? `${styles.questionEditor} ${styles.inlineEditor}` 
    : styles.questionEditor;

  const canSave = formData.text.trim().length > 0 && imageUrl.isValid;

  return (
    <div className={containerClassName}>
      {!inline && (
        <h3 className={styles.editorTitle}>
          {question ? t('questions.editTitle') : t('questions.createTitle')}
        </h3>
      )}
      
      <FormField 
        required
        className={styles.textField}
      >
        <input
          type="text"
          value={formData.text}
          onChange={(e) => updateFormField('text', e.target.value)}
          placeholder={t('questions.form.textPlaceholder')}
          required
          autoFocus={!inline}
          className={styles.textInput}
        />
      </FormField>

      <FormField 
        className={styles.imageField}
      >
        <ImageUrlField
          value={imageUrl.value}
          onChange={imageUrl.setValue}
          onValidationChange={imageUrl.handleValidationChange}
          placeholder={t('questions.form.imagePlaceholder')}
          previewMaxHeight={200}
        />
      </FormField>

      <FormField 
        required
        className={styles.typeField}
      >
        <select
          value={formData.questionType}
          onChange={(e) => handleQuestionTypeChange(e.target.value as QuestionType)}
          className={styles.typeSelect}
        >
          <option value={QuestionType.MULTIPLE_CHOICE}>
            {t('questions.types.multipleChoice')}
          </option>
          <option value={QuestionType.CHECKBOX}>
            {t('questions.types.checkbox')}
          </option>
          <option value={QuestionType.DROPDOWN}>
            {t('questions.types.dropdown')}
          </option>
          <option value={QuestionType.LINEAR_SCALE}>
            {t('questions.types.linearScale')}
          </option>
          <option value={QuestionType.TEXT}>
            {t('questions.types.text')}
          </option>
        </select>
      </FormField>

      <FormField className={styles.requiredField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.required}
            onChange={(e) => updateFormField('required', e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>
            {t('questions.form.required')}
          </span>
        </label>
      </FormField>

      {renderOptionsEditor()}

      <div className={styles.formActions}>
        <Button
          variant="text"
          onClick={onCancel}
          type="button"
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!canSave}
          type="button"
        >
          {question ? t('common.save') : t('actions.add')}
        </Button>
      </div>
    </div>
  );
};