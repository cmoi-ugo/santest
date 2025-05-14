import { useState, useEffect } from 'react';
import { QuestionType, Question, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import { DEFAULT_SCALE_OPTIONS, DEFAULT_OPTIONS, UI } from '@/services/constants';
import styles from '@/features/quiz/styles/QuestionEditor.module.css';
import { MdAdd, MdDelete } from 'react-icons/md';

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

    useEffect(() => {
        if (question) {
            setFormData({
                text: question.text,
                questionType: question.question_type,
                required: question.required,
                options: question.options || getDefaultOptionsForType(question.question_type)
            });
        } else {
            setFormData({
                text: '',
                questionType: QuestionType.MULTIPLE_CHOICE,
                required: false,
                options: DEFAULT_OPTIONS
            });
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
        let finalOptions = formData.options;
        const questionData: Partial<Question> = {
            quiz_id: quizId,
            text: formData.text,
            question_type: formData.questionType,
            required: formData.required,
            options: finalOptions,
            ...(question && { id: question.id })
        };

        onSave(questionData);
    };

    const renderOptionsEditor = () => {
        if (formData.questionType === QuestionType.LINEAR_SCALE) {
            const scaleOptions = formData.options as LinearScaleOptions;
            return (
                <div className={styles.scaleOptionsEditor}>
                    <div className={styles.scaleRow}>
                        <label>Valeur minimale :</label>
                        <input
                            type="number"
                            value={scaleOptions.min_value}
                            onChange={(e) => handleScaleOptionChange('min_value', parseInt(e.target.value))}
                            min={0}
                        />
                    </div>
                    <div className={styles.scaleRow}>
                        <label>Valeur maximale :</label>
                        <input
                            type="number"
                            value={scaleOptions.max_value}
                            onChange={(e) => handleScaleOptionChange('max_value', parseInt(e.target.value))}
                            min={scaleOptions.min_value + 1}
                        />
                    </div>
                    <div className={styles.scaleRow}>
                        <label>Label minimum (optionnel) :</label>
                        <input
                            type="text"
                            value={scaleOptions.min_label || ''}
                            onChange={(e) => handleScaleOptionChange('min_label', e.target.value)}
                        />
                    </div>
                    <div className={styles.scaleRow}>
                        <label>Label maximum (optionnel) :</label>
                        <input
                            type="text"
                            value={scaleOptions.max_label || ''}
                            onChange={(e) => handleScaleOptionChange('max_label', e.target.value)}
                        />
                    </div>
                </div>
            );
        }

        if ([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN].includes(formData.questionType)) {
            const options = formData.options as QuestionOption[];
            return (
                <div className={styles.optionsEditor}>
                    <h4>Options</h4>
                    {options.map((option, index) => (
                        <div key={index} className={styles.optionRow}>
                            <input
                                type="text"
                                value={option.label}
                                onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                placeholder="Label de l'option"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className={styles.removeButton}
                            >
                                <MdDelete size={UI.ICONS.SIZE.MEDIUM} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className={styles.addButton}
                    >
                        <MdAdd size={UI.ICONS.SIZE.SMALL} /> Ajouter une option
                    </button>
                </div>
            );
        }

        return null;
    };

    const containerClassName = inline 
        ? `${styles.questionEditor} ${styles.inlineEditor}` 
        : styles.questionEditor;

    return (
        <div className={containerClassName}>
            {!inline && <h3>{question ? 'Modifier la question' : 'Nouvelle question'}</h3>}
            
            <div className={styles.formGroup}>
                <input
                    type="text"
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Entrez votre question"
                    required
                    autoFocus
                />
            </div>

            <div className={styles.formGroup}>
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
            </div>

            <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={formData.required}
                        onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                    />
                    Question obligatoire
                </label>
            </div>

            {renderOptionsEditor()}

            <div className={styles.formActions}>
                <button
                    type="button"
                    onClick={onCancel}
                    className={styles.cancelButton}
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className={styles.saveButton}
                    disabled={!formData.text.trim()}
                >
                    {question ? 'Enregistrer' : 'Ajouter'}
                </button>
            </div>
        </div>
    );
};