import React from 'react';
import { Question, QuestionType, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import styles from './QuestionDisplay.module.css';

interface QuestionDisplayProps {
    question: Question;
    index: number;
    value: any;
    onChange: (value: any) => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    index,
    value,
    onChange
}) => {
    const renderQuestionInput = () => {
        switch (question.question_type) {
            case QuestionType.MULTIPLE_CHOICE:
                return (
                    <div className={styles.optionsContainer}>
                        {(question.options as QuestionOption[])?.map((option) => (
                            <label key={option.value} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name={`question_${question.id}`}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => onChange(e.target.value)}
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case QuestionType.CHECKBOX:
                return (
                    <div className={styles.optionsContainer}>
                        {(question.options as QuestionOption[])?.map((option) => (
                            <label key={option.value} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={Array.isArray(value) && value.includes(option.value)}
                                    onChange={(e) => {
                                        const currentValues = Array.isArray(value) ? value : [];
                                        if (e.target.checked) {
                                            onChange([...currentValues, option.value]);
                                        } else {
                                            onChange(currentValues.filter(v => v !== option.value));
                                        }
                                    }}
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case QuestionType.DROPDOWN:
                return (
                    <select
                        className={styles.dropdown}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    >
                        <option value="">Sélectionner une option</option>
                        {(question.options as QuestionOption[])?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case QuestionType.LINEAR_SCALE:
                const scaleOptions = question.options as LinearScaleOptions;
                const scaleValues = Array.from(
                    { length: scaleOptions.max_value - scaleOptions.min_value + 1 },
                    (_, i) => scaleOptions.min_value + i
                );

                return (
                    <div className={styles.scaleContainer}>
                        <span className={styles.scaleLabel}>
                            {scaleOptions.min_label || scaleOptions.min_value}
                        </span>
                        <div className={styles.scaleValues}>
                            {scaleValues.map(scaleValue => (
                                <label key={scaleValue} className={styles.scaleItem}>
                                    <input
                                        type="radio"
                                        name={`question_${question.id}`}
                                        value={scaleValue}
                                        checked={value === scaleValue}
                                        onChange={(e) => onChange(parseInt(e.target.value))}
                                    />
                                    <span>{scaleValue}</span>
                                </label>
                            ))}
                        </div>
                        <span className={styles.scaleLabel}>
                            {scaleOptions.max_label || scaleOptions.max_value}
                        </span>
                    </div>
                );

            case QuestionType.TEXT:
                return (
                    <textarea
                        className={styles.textArea}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Entrez votre réponse..."
                        rows={3}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.questionContainer}>
            <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>{index + 1}.</span>
                <h3 className={styles.questionText}>
                    {question.text}
                    {question.required && <span className={styles.required}> *</span>}
                </h3>
            </div>
            <div className={styles.questionBody}>
                {renderQuestionInput()}
            </div>
        </div>
    );
};