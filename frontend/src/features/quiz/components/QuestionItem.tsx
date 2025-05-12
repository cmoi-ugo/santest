import { useState } from 'react';
import { QuestionType, Question, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import styles from './QuestionItem.module.css';
import { MdEdit, MdDelete, MdDragIndicator } from 'react-icons/md';

interface QuestionItemProps {
    question: Question;
    index: number;
    onEdit: (question: Question) => void;
    onDelete: (questionId: number) => void;
    onReorder?: (questionId: number, newOrder: number) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ 
    question, 
    index, 
    onEdit, 
    onDelete,
    onReorder 
}) => {
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

    return (
        <div className={styles.questionItem}>
            <div className={styles.questionHeader}>
                <div className={styles.dragHandle}>
                    <MdDragIndicator />
                </div>
                <div className={styles.questionNumber}>{index + 1}.</div>
                <div className={styles.questionText}>
                    {question.text}
                    {question.required && <span className={styles.required}>*</span>}
                </div>
                <div className={styles.questionActions}>
                    <button 
                        className={styles.actionButton}
                        onClick={() => onEdit(question)}
                        title="Modifier"
                    >
                        <MdEdit />
                    </button>
                    <button 
                        className={styles.actionButton}
                        onClick={() => onDelete(question.id)}
                        title="Supprimer"
                    >
                        <MdDelete />
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