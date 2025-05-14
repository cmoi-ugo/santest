import { useState } from 'react';
import { QuestionType, Question, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import { QuestionEditor } from '@/features/quiz/components/QuestionEditor';
import { UI } from '@/services/constants';
import styles from '@/features/quiz/styles/QuestionItem.module.css';
import { MdEdit, MdDelete, MdDragIndicator } from 'react-icons/md';

interface QuestionItemProps {
    question: Question;
    index: number;
    onDelete: (questionId: number) => void;
    onSave: (question: Partial<Question>) => void;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ 
    question, 
    index, 
    onDelete,
    onSave,
    dragHandleProps
}) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = (updatedQuestion: Partial<Question>) => {
        onSave(updatedQuestion);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const renderQuestionPreview = () => {
        switch (question.question_type) {
            case QuestionType.MULTIPLE_CHOICE:
                return (
                    <div className={styles.optionsPreview}>
                        {(question.options as QuestionOption[])?.map((option, idx) => (
                            <div key={idx} className={styles.radioOption}>
                                <input type="radio" disabled />
                                <label>{option.label}</label>
                            </div>
                        ))}
                    </div>
                );
                
            case QuestionType.CHECKBOX:
                return (
                    <div className={styles.optionsPreview}>
                        {(question.options as QuestionOption[])?.map((option, idx) => (
                            <div key={idx} className={styles.checkboxOption}>
                                <input type="checkbox" disabled />
                                <label>{option.label}</label>
                            </div>
                        ))}
                    </div>
                );
                
            case QuestionType.DROPDOWN:
                return (
                    <div className={styles.optionsPreview}>
                        <select disabled className={styles.dropdownPreview}>
                            <option>Sélectionner une option</option>
                            {(question.options as QuestionOption[])?.map((option, idx) => (
                                <option key={idx}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                );
                
            case QuestionType.LINEAR_SCALE:
                const scaleOptions = question.options as LinearScaleOptions;
                return (
                    <div className={styles.scalePreview}>
                        <span className={styles.scaleLabel}>{scaleOptions?.min_label || scaleOptions?.min_value}</span>
                        <div className={styles.scaleRange}>
                            {scaleOptions && Array.from(
                                { length: scaleOptions.max_value - scaleOptions.min_value + 1 }, 
                                (_, i) => scaleOptions.min_value + i
                            ).map(value => (
                                <span key={value} className={styles.scaleValue}>{value}</span>
                            ))}
                        </div>
                        <span className={styles.scaleLabel}>{scaleOptions?.max_label || scaleOptions?.max_value}</span>
                    </div>
                );
                
            case QuestionType.TEXT:
                return (
                    <div className={styles.optionsPreview}>
                        <input type="text" placeholder="Réponse textuelle" disabled className={styles.textInput} />
                    </div>
                );
                
            default:
                return null;
        }
    };

    if (isEditing) {
        return (
            <div className={styles.questionItem}>
                <div className={styles.inlineEditorWrapper}>
                    <QuestionEditor
                        quizId={question.quiz_id}
                        question={question}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        inline={true}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.questionItem}>
            <div className={styles.questionHeader}>
                <div className={styles.dragHandle} {...dragHandleProps}>
                    <MdDragIndicator size={UI.ICONS.SIZE.MEDIUM} />
                </div>
                <div className={styles.questionNumber}>{index + 1}.</div>
                <div className={styles.questionText}>
                    {question.text}
                    {question.required && <span className={styles.required}>*</span>}
                </div>
                <div className={styles.questionActions}>
                    <button 
                        className={styles.actionButton}
                        onClick={handleEditClick}
                        title="Modifier"
                    >
                        <MdEdit size={UI.ICONS.SIZE.MEDIUM}/>
                    </button>
                    <button 
                        className={styles.actionButton}
                        onClick={() => onDelete(question.id)}
                        title="Supprimer"
                    >
                        <MdDelete size={UI.ICONS.SIZE.MEDIUM}/>
                    </button>
                </div>
            </div>
            <div className={styles.questionContent}>
                {renderQuestionPreview()}
                <div className={styles.questionType}>
                    Type: {getQuestionTypeLabel(question.question_type)}
                </div>
            </div>
        </div>
    );
};

const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            return "Choix multiple";
        case QuestionType.CHECKBOX:
            return "Cases à cocher";
        case QuestionType.DROPDOWN:
            return "Liste déroulante";
        case QuestionType.LINEAR_SCALE:
            return "Échelle linéaire";
        case QuestionType.TEXT:
            return "Texte";
        default:
            return "Inconnu";
    }
};