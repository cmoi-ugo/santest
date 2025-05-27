import { useTranslation } from '@/hooks/useTranslation';
import React, { useState, useEffect } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { 
    Dimension, 
    DimensionScoringRule,
    DimensionScoringRuleCreateInput 
} from '@/features/quiz/types/dimension.types';
import { 
    Question, 
    QuestionType,
    QuestionOption,
    LinearScaleOptions 
} from '@/features/quiz/types/question.types';
import styles from './QuestionDimensionLink.module.css';
import { MdAdd, MdDelete } from 'react-icons/md';
import { UI } from '@/config';

interface QuestionDimensionLinkProps {
    question: Question;
    dimensions: Dimension[];
}

interface ScoringRuleForm {
    dimension_id: number;
    answer_value: string;
    score: number;
}

export const QuestionDimensionLink: React.FC<QuestionDimensionLinkProps> = ({ 
    question, 
    dimensions 
}) => {
    const { t } = useTranslation();
    const [scoringRules, setScoringRules] = useState<DimensionScoringRule[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<ScoringRuleForm>({
        dimension_id: dimensions[0]?.id || 0,
        answer_value: '',
        score: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

    useEffect(() => {
        if (dimensions.length > 0) {
            fetchScoringRules();
        }
    }, [question.id, dimensions]);

    const fetchScoringRules = async () => {
        try {
            setIsLoading(true);
            const allRules: DimensionScoringRule[] = [];
            for (const dimension of dimensions) {
                const rules = await dimensionApi.getScoringRules(dimension.id);
                const questionRules = rules.filter(r => r.question_id === question.id);
                allRules.push(...questionRules);
            }
            setScoringRules(allRules);
        } catch (err) {
            setError(t('dimensions.scoring.loadingError'));
        } finally {
            setIsLoading(false);
        }
    };

    const getAnswerOptions = (): string[] => {
        switch (question.question_type) {
            case QuestionType.MULTIPLE_CHOICE:
            case QuestionType.CHECKBOX:
            case QuestionType.DROPDOWN:
                return (question.options as QuestionOption[]).map(opt => opt.value);
            case QuestionType.LINEAR_SCALE:
                const scale = question.options as LinearScaleOptions;
                return Array.from(
                    { length: scale.max_value - scale.min_value + 1 },
                    (_, i) => (scale.min_value + i).toString()
                );
            case QuestionType.TEXT:
                return [];
            default:
                return [];
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsLoading(true);
            const ruleData: DimensionScoringRuleCreateInput = {
                dimension_id: formData.dimension_id,
                question_id: question.id,
                answer_value: formData.answer_value,
                score: formData.score
            };
            
            const newRule = await dimensionApi.createScoringRule(ruleData);
            setScoringRules([...scoringRules, newRule]);
            
            resetForm();
        } catch (err) {
            setError(t('dimensions.scoring.savingError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (ruleId: number) => {
        const isConfirmed = await confirm({
            title: t('dimensions.scoring.deleteConfirmTitle'),
            message: t('dimensions.scoring.deleteConfirmMessage'),
            confirmLabel: t('actions.delete'),
            cancelLabel: t('common.cancel'),
            destructive: true
        });

        if (isConfirmed) {
            try {
                await dimensionApi.deleteScoringRule(ruleId);
                setScoringRules(scoringRules.filter(r => r.id !== ruleId));
            } catch (err) {
                setError(t('dimensions.scoring.deletingError'));
            }
        }
    };

    const resetForm = () => {
        setFormData({
            dimension_id: dimensions[0]?.id || 0,
            answer_value: '',
            score: 0
        });
        setShowForm(false);
    };

    const getDimensionName = (dimensionId: number): string => {
        const dimension = dimensions.find(d => d.id === dimensionId);
        return dimension?.name || t('dimensions.scoring.unknownDimension');
    };

    const getAnswerLabel = (value: string): string => {
        if (question.question_type === QuestionType.LINEAR_SCALE) {
            return value;
        }
        
        const option = (question.options as QuestionOption[])?.find(opt => opt.value === value);
        return option?.label || value;
    };

    if (dimensions.length === 0) {
        return (
            <div className={styles.noDimensions}>
                {t('dimensions.scoring.noDimensionsForQuiz')}
            </div>
        );
    }

    if (isLoading && scoringRules.length === 0) {
        return <LoadingIndicator />;
    }

    const answerOptions = getAnswerOptions();
    
    return (
        <div className={styles.linkContainer}>
            <div className={styles.header}>
                <h4>{t('dimensions.scoring.title')}</h4>
                {!showForm && answerOptions.length > 0 && (
                    <Button
                        variant="primary"
                        size="small"
                        icon={<MdAdd size={UI.ICONS.SIZE.MEDIUM} />}
                        onClick={() => setShowForm(true)}
                    >
                        {t('dimensions.scoring.addRule')}
                    </Button>
                )}
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && answerOptions.length > 0 && (
                <form onSubmit={handleSubmit} className={styles.ruleForm}>
                    <div className={styles.formRow}>
                        <FormField label={t('dimensions.scoring.dimension')}>
                            <select
                                value={formData.dimension_id}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    dimension_id: parseInt(e.target.value) 
                                })}
                            >
                                {dimensions.map(dimension => (
                                    <option key={dimension.id} value={dimension.id}>
                                        {dimension.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label={t('dimensions.scoring.answer')} required>
                            <select
                                value={formData.answer_value}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    answer_value: e.target.value 
                                })}
                                required
                            >
                                <option value="">{t('dimensions.scoring.selectAnswer')}</option>
                                {answerOptions.map(value => (
                                    <option key={value} value={value}>
                                        {getAnswerLabel(value)}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label={t('dimensions.scoring.score')} required>
                            <input
                                type="number"
                                value={formData.score}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    score: parseFloat(e.target.value) || 0 
                                })}
                                step="0.1"
                                required
                            />
                        </FormField>
                    </div>

                    <div className={styles.formActions}>
                        <Button
                            variant="text"
                            type="button"
                            onClick={resetForm}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading || !formData.answer_value}
                            loading={isLoading}
                        >
                            {t('actions.add')}
                        </Button>
                    </div>
                </form>
            )}

            <div className={styles.rulesList}>
                {scoringRules.length === 0 ? (
                    <p className={styles.noRules}>
                        {answerOptions.length === 0 
                            ? t('dimensions.scoring.noRulesForTextType')
                            : t('dimensions.scoring.noRules')
                        }
                    </p>
                ) : (
                    <table className={styles.rulesTable}>
                        <thead>
                            <tr>
                                <th>{t('dimensions.scoring.dimension')}</th>
                                <th>{t('dimensions.scoring.answer')}</th>
                                <th>{t('dimensions.scoring.score')}</th>
                                <th>{t('actions.title')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scoringRules.map(rule => (
                                <tr key={rule.id}>
                                    <td>{getDimensionName(rule.dimension_id)}</td>
                                    <td>{getAnswerLabel(rule.answer_value)}</td>
                                    <td>{rule.score}</td>
                                    <td>
                                        <Button
                                            variant="text"
                                            size="small"
                                            icon={<MdDelete size={UI.ICONS.SIZE.SMALL} />}
                                            onClick={() => handleDelete(rule.id)}
                                            className={styles.deleteButton}
                                            title={t('actions.delete')}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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