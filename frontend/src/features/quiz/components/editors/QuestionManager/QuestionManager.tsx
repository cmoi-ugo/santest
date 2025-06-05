import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { MdAdd } from 'react-icons/md';

import { Button, ConfirmDialog, ErrorMessage, LoadingIndicator } from '@/components/ui';
import { UI } from '@/config';
import { useConfirm, useTranslation } from '@/hooks';

import { questionApi } from '../../../api/questionApi';
import { DraggableQuestionItem } from '../../shared/DraggableQuestionItem/DraggableQuestionItem';
import type { Dimension } from '../../../types/dimension.types';
import type { Question, QuestionCreateInput, QuestionUpdateInput } from '../../../types/question.types';
import { QuestionEditor } from '../QuestionEditor/QuestionEditor';
import styles from './QuestionManager.module.css';

interface QuestionManagerProps {
    quizId: number;
    dimensions: Dimension[];
}

/**
 * Gestionnaire de questions avec drag & drop, édition inline et CRUD complet
 */
export const QuestionManager: React.FC<QuestionManagerProps> = ({ quizId, dimensions }) => {
    const { t } = useTranslation();
    const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
    
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
            setError(null);
            const data = await questionApi.getAll(quizId);
            setQuestions(data);
        } catch (err) {
            setError(t('questions.errors.loading'));
            console.error('Failed to fetch questions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNewQuestion = async (questionData: Partial<Question>) => {
        if (!questionData.text || !questionData.question_type) {
            setError(t('questions.errors.missingData'));
            return;
        }

        try {
            setError(null);
            const createData: QuestionCreateInput = {
                quiz_id: quizId,
                text: questionData.text,
                question_type: questionData.question_type,
                options: questionData.options,
                required: questionData.required || false,
                order: questions.length,
                image_url: questionData.image_url
            };
            
            const newQuestion = await questionApi.create(createData);
            setQuestions(prev => [...prev, newQuestion]);
            setShowForm(false);
        } catch (err) {
            setError(t('questions.errors.saving'));
            console.error('Failed to create question:', err);
        }
    };

    const handleSaveExistingQuestion = async (questionData: Partial<Question>) => {
        if (!questionData.id) {
            setError(t('questions.errors.missingId'));
            return;
        }

        try {
            setError(null);
            const updateData: QuestionUpdateInput = {
                text: questionData.text,
                question_type: questionData.question_type,
                options: questionData.options,
                required: questionData.required,
                image_url: questionData.image_url
            };
            
            const updated = await questionApi.update(questionData.id, updateData);
            setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
        } catch (err) {
            setError(t('questions.errors.saving'));
            console.error('Failed to update question:', err);
        }
    };

    const handleDeleteQuestion = async (questionId: number) => {
        const isConfirmed = await confirm({
            title: t('questions.deleteConfirmTitle'),
            message: t('questions.deleteConfirmMessage'),
            confirmLabel: t('actions.delete'),
            cancelLabel: t('common.cancel'),
            destructive: true
        });

        if (isConfirmed) {
            try {
                await questionApi.delete(questionId);
                setQuestions(prev => prev.filter(q => q.id !== questionId));
            } catch (err) {
                setError(t('questions.errors.deleting'));
                console.error('Failed to delete question:', err);
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

        if (activeIndex === -1 || overIndex === -1) {
            return;
        }

        const reorderedQuestions = arrayMove(questions, activeIndex, overIndex);
        setQuestions(reorderedQuestions);

        // Sauvegarde de l'ordre en arrière-plan
        try {
            setIsSavingOrder(true);
            await questionApi.reorder(
                quizId,
                reorderedQuestions.map((q, index) => ({ id: q.id, order: index }))
            );
        } catch (err) {
            setError(t('questions.errors.reordering'));
            // Rollback en cas d'erreur
            setQuestions(questions);
            console.error('Failed to reorder questions:', err);
        } finally {
            setIsSavingOrder(false);
        }
    };

    const handleAddQuestion = () => {
        setShowForm(true);
        setError(null);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setError(null);
    };

    const hasQuestions = questions.length > 0;
    const showEmptyState = !hasQuestions && !showForm;

    if (isLoading && !hasQuestions) {
        return <LoadingIndicator message={t('questions.loading')} />;
    }

    return (
        <div className={styles.questionManager}>
            <div className={styles.header}>
                <h3 className={styles.title}>{t('quiz.tabs.questions')}</h3>
                <div className={styles.headerActions}>
                    {isSavingOrder && (
                        <span className={styles.savingIndicator}>
                            {t('questions.saving')}
                        </span>
                    )}
                    {!showForm && (
                        <Button
                            variant="primary"
                            size="small"
                            icon={<MdAdd size={UI.ICONS.SIZE.MEDIUM} />}
                            onClick={handleAddQuestion}
                        >
                            {t('questions.addQuestion')}
                        </Button>
                    )}
                </div>
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && (
                <div className={styles.questionForm}>
                    <QuestionEditor
                        quizId={quizId}
                        question={null}
                        onSave={handleSaveNewQuestion}
                        onCancel={handleCancelForm}
                    />
                </div>
            )}

            <div className={styles.questionsList}>
                {showEmptyState ? (
                    <div className={styles.emptyState}>
                        <p className={styles.noQuestions}>
                            {t('questions.noQuestions')}
                        </p>
                        <p className={styles.noQuestionsHint}>
                            {t('questions.noQuestionsHint')}
                        </p>
                    </div>
                ) : hasQuestions ? (
                    <DndContext 
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={questions.map(q => q.id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className={styles.questionsGrid}>
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
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : null}
            </div>

            <ConfirmDialog
                isOpen={isOpen}
                title={options.title || t('common.confirm')}
                message={options.message || t('common.confirm')}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                destructive={options.destructive}
            />
        </div>
    );
};