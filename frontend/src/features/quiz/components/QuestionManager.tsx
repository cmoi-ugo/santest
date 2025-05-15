import React, { useState, useEffect } from 'react';
import { questionApi } from '@/features/quiz/api/questionApi';
import { Question } from '@/features/quiz/types/question.types';
import { Dimension } from '@/features/quiz/types/dimension.types';
import { DraggableQuestionItem } from '@/features/quiz/components/DraggableQuestionItem';
import { QuestionEditor } from '@/features/quiz/components/QuestionEditor';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import styles from '@/features/quiz/styles/QuestionManager.module.css';
import { MdAdd } from 'react-icons/md';
import { UI, MESSAGES } from '@/services/constants';

interface QuestionManagerProps {
    quizId: number;
    dimensions: Dimension[];
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ quizId, dimensions }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (quizId) {
            fetchQuestions();
        }
    }, [quizId]);

    const fetchQuestions = async () => {
        try {
            setIsLoading(true);
            const data = await questionApi.getAll(quizId);
            setQuestions(data);
        } catch (err) {
            setError('Erreur lors du chargement des questions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNewQuestion = async (questionData: Partial<Question>) => {
        try {
            const newQuestion = await questionApi.create({
                quiz_id: quizId,
                text: questionData.text!,
                question_type: questionData.question_type!,
                options: questionData.options,
                required: questionData.required,
                order: questions.length
            });
            setQuestions([...questions, newQuestion]);
            setShowForm(false);
            setError(null);
        } catch (err) {
            setError('Erreur lors de l\'enregistrement de la question');
        }
    };

    const handleSaveExistingQuestion = async (questionData: Partial<Question>) => {
        try {
            const updated = await questionApi.update(questionData.id!, {
                text: questionData.text,
                question_type: questionData.question_type,
                options: questionData.options,
                required: questionData.required
            });
            setQuestions(questions.map(q => q.id === updated.id ? updated : q));
            setError(null);
        } catch (err) {
            setError('Erreur lors de l\'enregistrement de la question');
        }
    };

    const handleDeleteQuestion = async (questionId: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
            try {
                await questionApi.delete(questionId);
                setQuestions(questions.filter(q => q.id !== questionId));
            } catch (err) {
                setError('Erreur lors de la suppression de la question');
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const activeIndex = questions.findIndex(q => q.id.toString() === active.id);
        const overIndex = questions.findIndex(q => q.id.toString() === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
            const reorderedQuestions = arrayMove(questions, activeIndex, overIndex);
            setQuestions(reorderedQuestions);

            try {
                setIsSavingOrder(true);
                await questionApi.reorder(
                    quizId,
                    reorderedQuestions.map((q, index) => ({ id: q.id, order: index }))
                );
            } catch (err) {
                setError('Erreur lors de la sauvegarde de l\'ordre des questions');
                setQuestions(questions);
            } finally {
                setIsSavingOrder(false);
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
    };

    if (isLoading) {
        return (
            <div className={styles.questionManager}>
                <div className={styles.loadingContainer}>{MESSAGES.UI.LOADING}</div>
            </div>
        );
    }

    return (
        <div className={styles.questionManager}>
            <div className={styles.header}>
                <h3>Questions</h3>
                <div className={styles.headerActions}>
                    {isSavingOrder && <span className={styles.savingIndicator}>Sauvegarde...</span>}
                    {!showForm && (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className={styles.addButton}
                        >
                            <MdAdd size={UI.ICONS.SIZE.SMALL} /> Ajouter une question
                        </button>
                    )}
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {showForm && (
                <div className={styles.questionForm}>
                    <QuestionEditor
                        quizId={quizId}
                        question={null}
                        onSave={handleSaveNewQuestion}
                        onCancel={resetForm}
                    />
                </div>
            )}

            <div className={styles.questionsList}>
                {questions.length === 0 && !showForm ? (
                    <p className={styles.noQuestions}>Aucune question pour le moment</p>
                ) : (
                    <DndContext 
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={questions.map(q => q.id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {questions.map((question, index) => (
                                <DraggableQuestionItem
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    onDelete={handleDeleteQuestion}
                                    onSave={handleSaveExistingQuestion}
                                    dimensions={dimensions}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
};