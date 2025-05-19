import React from 'react';
import { Question, QuestionType, QuestionOption, LinearScaleOptions } from '@/features/quiz/types/question.types';
import { MultipleChoiceQuestion } from '@/components/quiz/QuestionTypes/MultipleChoiceQuestion';
import { CheckboxQuestion } from '@/components/quiz/QuestionTypes/CheckboxQuestion';
import { DropdownQuestion } from '@/components/quiz/QuestionTypes/DropdownQuestion';
import { LinearScaleQuestion } from '@/components/quiz/QuestionTypes/LinearScaleQuestion';
import { TextQuestion } from '@/components/quiz/QuestionTypes/TextQuestion';
import styles from '@/features/quiz/styles/QuestionDisplay.module.css';

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
          <MultipleChoiceQuestion
            questionId={question.id}
            options={question.options as QuestionOption[]}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.CHECKBOX:
        return (
          <CheckboxQuestion
            questionId={question.id}
            options={question.options as QuestionOption[]}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.DROPDOWN:
        return (
          <DropdownQuestion
            questionId={question.id}
            options={question.options as QuestionOption[]}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.LINEAR_SCALE:
        return (
          <LinearScaleQuestion
            questionId={question.id}
            options={question.options as LinearScaleOptions}
            value={value}
            onChange={onChange}
          />
        );
      
      case QuestionType.TEXT:
        return (
          <TextQuestion
            value={value}
            onChange={onChange}
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