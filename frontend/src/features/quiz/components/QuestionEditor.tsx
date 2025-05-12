import { useState, useEffect } from 'react';
import { QuestionType, Question, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import styles from './QuestionEditor.module.css';
import { MdAdd, MdDelete } from 'react-icons/md';

interface QuestionEditorProps {
    quizId: number;
    question?: Question | null;
    onSave: (question: Partial<Question>) => void;
    onCancel: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
    quizId,
    question, 
    onSave, 
    onCancel 
}) => {
    const [text, setText] = useState(question?.text || '');
    const [questionType, setQuestionType] = useState(question?.question_type || QuestionType.MULTIPLE_CHOICE);
    const [required, setRequired] = useState(question?.required || false);
    const [options, setOptions] = useState<QuestionOption[]>([]);
    const [scaleOptions, setScaleOptions] = useState<LinearScaleOptions>({
        min_value: 1,
        max_value: 5,
        min_label: '',
        max_label: ''
    });

    useEffect(() => {
        if (question) {
            setText(question.text);
            setQuestionType(question.question_type);
            setRequired(question.required);
            
            if (question.question_type === QuestionType.LINEAR_SCALE) {
                setScaleOptions(question.options as LinearScaleOptions);
            } else if (Array.isArray(question.options)) {
                setOptions(question.options as QuestionOption[]);
            }
        }
    }, [question]);

    const handleAddOption = () => {
        setOptions([...options, { label: '', value: `option_${options.length + 1}` }]);
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleOptionChange = (index: number, field: 'label' | 'value', value: string) => {
        const newOptions = [...options];
        newOptions[index][field] = value;
        setOptions(newOptions);
    };

    const handleSave = () => {
        let finalOptions: QuestionOption[] | LinearScaleOptions | undefined;
        
        if (questionType === QuestionType.LINEAR_SCALE) {
            finalOptions = scaleOptions;
        } else if ([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN].includes(questionType)) {
            finalOptions = options.filter(opt => opt.label.trim() !== '');
        }

        const questionData: Partial<Question> = {
            quiz_id: quizId,
            text,
            question_type: questionType,
            required,
            options: finalOptions,
            ...(question && { id: question.id })
        };

        onSave(questionData);
    };

    const renderOptionsEditor = () => {
        if (questionType === QuestionType.LINEAR_SCALE) {
            return (
                <div className={styles.scaleOptionsEditor}>
                    <div className={styles.scaleRow}>
                        <label>Valeur minimale :</label>
                        <input
                            type="number"
                            value={scaleOptions.min_value}
                            onChange={(e) => setScaleOptions({
                                ...scaleOptions,
                                min_value: parseInt(e.target.value)
                            })}
                            min={0}
                        />
                    </div>
                    <div className={styles.scaleRow}>
                        <label>Valeur maximale :</label>
                        <input
                            type="number"
                            value={scaleOptions.max_value}
                            onChange={(e) => setScaleOptions({
                                ...scaleOptions,
                                max_value: parseInt(e.target.value)
                            })}
                            min={scaleOptions.min_value + 1}
                        />
                    </div>
                    <div className={styles.scaleRow}>
                        <label>Label minimum (optionnel) :</label>
                        <input
                            type="text"
                            value={scaleOptions.min_label || ''}
                            onChange={(e) => setScaleOptions({
                                ...scaleOptions,
                                min_label: e.target.value
                            })}
                        />
                    </div>
                    <div className={styles.scaleRow}>
                        <label>Label maximum (optionnel) :</label>
                        <input
                            type="text"
                            value={scaleOptions.max_label || ''}
                            onChange={(e) => setScaleOptions({
                                ...scaleOptions,
                                max_label: e.target.value
                            })}
                        />
                    </div>
                </div>
            );
        }

        if ([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN].includes(questionType)) {
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
                                <MdDelete />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className={styles.addButton}
                    >
                        <MdAdd /> Ajouter une option
                    </button>
                </div>
            );
        }

        return null;
    };

    useEffect(() => {
        if ([QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN].includes(questionType)) {
            if (options.length === 0) {
                setOptions([
                    { label: '', value: 'option_1' },
                    { label: '', value: 'option_2' }
                ]);
            }
        }
    }, [questionType]);

    return (
        <div className={styles.questionEditor}>
            <h3>{question ? 'Modifier la question' : 'Nouvelle question'}</h3>
            
            <div className={styles.formGroup}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Entrez votre question"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
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
                        checked={required}
                        onChange={(e) => setRequired(e.target.checked)}
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
                    disabled={!text.trim()}
                >
                    {question ? 'Mettre à jour' : 'Ajouter'}
                </button>
            </div>
        </div>
    );
};