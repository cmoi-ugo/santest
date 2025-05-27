import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import { QuestionType, Question, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import { DEFAULT_SCALE_OPTIONS, DEFAULT_OPTIONS } from '@/config';
import { OptionsEditor } from '@/features/quiz/components/editors/OptionsEditor/OptionsEditor';
import { ScaleOptionsEditor } from '@/features/quiz/components/editors/ScaleOptionsEditor/ScaleOptionsEditor';
import { ImageUrlField, useImageUrlField } from '@/components/ui/ImageUrlField/ImageUrlField';
import styles from './QuestionEditor.module.css';

interface QuestionEditorProps {
  quizId: number;
  question?: Question | null;
  onSave: (question: Partial<Question>) => void;
  onCancel: () => void;
  inline?: boolean;
}

const getDefaultOptionsForType = (type: QuestionType): QuestionOption[] | LinearScaleOptions | undefined => {
  if (type === QuestionType.LINEAR_SCALE) {
    return DEFAULT_SCALE_OPTIONS;
  }
  if ([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN].includes(type)) {
    return DEFAULT_OPTIONS;
  }
  return undefined;
};

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  quizId,
  question, 
  onSave, 
  onCancel,
  inline = false
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(() => ({
    text: question?.text || '',
    questionType: question?.question_type || QuestionType.MULTIPLE_CHOICE,
    required: question?.required || false,
    options: question?.options || getDefaultOptionsForType(question?.question_type || QuestionType.MULTIPLE_CHOICE)
  }));

  const imageUrl = useImageUrlField(question?.image_url || '');

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
  }, [question]);

  const handleQuestionTypeChange = (newType: QuestionType) => {
    setFormData(prev => ({
      ...prev,
      questionType: newType,
      options: shouldResetOptions(prev.questionType, newType) 
        ? getDefaultOptionsForType(newType) 
        : prev.options
    }));
  };

  const shouldResetOptions = (oldType: QuestionType, newType: QuestionType): boolean => {
    const arrayOptionsTypes = [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN];
    const oldHasArrayOptions = arrayOptionsTypes.includes(oldType);
    const newHasArrayOptions = arrayOptionsTypes.includes(newType);
    
    return oldHasArrayOptions !== newHasArrayOptions || 
      oldType === QuestionType.LINEAR_SCALE || 
      newType === QuestionType.LINEAR_SCALE;
  };

  const handleAddOption = () => {
    if (Array.isArray(formData.options)) {
      const newOptions = [...formData.options];
      newOptions.push({ label: '', value: `option_${newOptions.length + 1}` });
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleRemoveOption = (index: number) => {
    if (Array.isArray(formData.options)) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleOptionChange = (index: number, field: 'label' | 'value', value: string) => {
    if (Array.isArray(formData.options)) {
      const newOptions = [...formData.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleScaleOptionChange = (field: keyof LinearScaleOptions, value: any) => {
    if (formData.questionType === QuestionType.LINEAR_SCALE && formData.options) {
      setFormData(prev => ({
        ...prev,
        options: { ...prev.options as LinearScaleOptions, [field]: value }
      }));
    }
  };

  const handleSave = () => {
    const questionData: Partial<Question> = {
      quiz_id: quizId,
      text: formData.text,
      question_type: formData.questionType,
      required: formData.required,
      image_url: imageUrl.getCleanUrl(),
      options: formData.options,
      ...(question && { id: question.id })
    };

    onSave(questionData);
  };

  const renderOptionsEditor = () => {
    if (formData.questionType === QuestionType.LINEAR_SCALE) {
      return (
        <ScaleOptionsEditor
          options={formData.options as LinearScaleOptions}
          onOptionChange={handleScaleOptionChange}
        />
      );
    }

    if ([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN].includes(formData.questionType)) {
      return (
        <OptionsEditor
          options={formData.options as QuestionOption[]}
          onOptionChange={handleOptionChange}
          onAddOption={handleAddOption}
          onRemoveOption={handleRemoveOption}
        />
      );
    }

    return null;
  };

  const containerClassName = inline 
    ? `${styles.questionEditor} ${styles.inlineEditor}` 
    : styles.questionEditor;

  const canSave = formData.text.trim() && imageUrl.isValid;

  return (
    <div className={containerClassName}>
      {!inline && <h3>{question ? t('questions.editTitle') : t('questions.createTitle')}</h3>}
      
      <FormField>
        <input
          type="text"
          value={formData.text}
          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
          placeholder={t('questions.form.textPlaceholder')}
          required
          autoFocus
        />
      </FormField>

      <ImageUrlField
        value={imageUrl.value}
        onChange={imageUrl.setValue}
        onValidationChange={imageUrl.handleValidationChange}
        placeholder={t('questions.form.imagePlaceholder')}
        previewMaxHeight={200}
      />

      <FormField>
        <select
          value={formData.questionType}
          onChange={(e) => handleQuestionTypeChange(e.target.value as QuestionType)}
        >
          <option value={QuestionType.MULTIPLE_CHOICE}>{t('questions.types.multipleChoice')}</option>
          <option value={QuestionType.CHECKBOX}>{t('questions.types.checkbox')}</option>
          <option value={QuestionType.DROPDOWN}>{t('questions.types.dropdown')}</option>
          <option value={QuestionType.LINEAR_SCALE}>{t('questions.types.linearScale')}</option>
          <option value={QuestionType.TEXT}>{t('questions.types.text')}</option>
        </select>
      </FormField>

      <FormField>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.required}
            onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
          />
          {t('questions.form.required')}
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