import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import { QuestionType, Question, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import { DEFAULT_SCALE_OPTIONS, DEFAULT_OPTIONS } from '@/services/config';
import { OptionsEditor } from '@/components/quiz/QuestionEditors/OptionsEditor';
import { ScaleOptionsEditor } from '@/components/quiz/QuestionEditors/ScaleOptionsEditor';
import { ImageUrlField, useImageUrlField } from '@/components/ui/ImageUrlField/ImageUrlField';
import styles from '@/features/quiz/styles/QuestionEditor.module.css';

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
      image_url: imageUrl.getCleanUrl() || undefined,
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
      {!inline && <h3>{question ? 'Modifier la question' : 'Nouvelle question'}</h3>}
      
      <FormField>
        <input
          type="text"
          value={formData.text}
          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Entrez votre question"
          required
          autoFocus
        />
      </FormField>

      <ImageUrlField
        value={imageUrl.value}
        onChange={imageUrl.setValue}
        onValidationChange={imageUrl.handleValidationChange}
        placeholder="URL de l'image de la question (optionnel)"
        previewMaxHeight={200}
      />

      <FormField>
        <select
          value={formData.questionType}
          onChange={(e) => handleQuestionTypeChange(e.target.value as QuestionType)}
        >
          <option value={QuestionType.MULTIPLE_CHOICE}>Choix multiple</option>
          <option value={QuestionType.CHECKBOX}>Cases à cocher</option>
          <option value={QuestionType.DROPDOWN}>Liste déroulante</option>
          <option value={QuestionType.LINEAR_SCALE}>Échelle linéaire</option>
          <option value={QuestionType.TEXT}>Texte</option>
        </select>
      </FormField>

      <FormField>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.required}
            onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
          />
          Question obligatoire
        </label>
      </FormField>

      {renderOptionsEditor()}

      <div className={styles.formActions}>
        <Button
          variant="text"
          onClick={onCancel}
          type="button"
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!canSave}
          type="button"
        >
          {question ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </div>
  );
};