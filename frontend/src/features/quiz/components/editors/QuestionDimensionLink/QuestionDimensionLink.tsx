import React, { useEffect, useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

import { Button, ConfirmDialog, ErrorMessage, FormField, LoadingIndicator } from '@/components/ui';
import { UI } from '@/config';
import { useConfirm, useTranslation } from '@/hooks';

import { dimensionApi } from '../../../api/dimensionApi';
import type { 
    Dimension, 
    DimensionScoringRule,
    DimensionScoringRuleCreateInput 
} from '../../../types/dimension.types';
import { 
    Question, 
    QuestionType,
    QuestionOption,
    LinearScaleOptions 
} from '../../../types/question.types';
import styles from './QuestionDimensionLink.module.css';

interface QuestionDimensionLinkProps {
    question: Question;
    dimensions: Dimension[];
}

interface ScoringRuleForm {
    dimension_id: number;
    answer_value: string;
    score: number;
}

/**
 * Gestionnaire de liaison entre questions et dimensions avec règles de scoring
 */
export const QuestionDimensionLink: React.FC<QuestionDimensionLinkProps> = ({ 
    question, 
    dimensions 
}) => {
    const { t } = useTranslation();
    const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
    
    const [scoringRules, setScoringRules] = useState<DimensionScoringRule[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<ScoringRuleForm>({
        dimension_id: dimensions[0]?.id || 0,
        answer_value: '',
        score: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (dimensions.length > 0) {
            fetchScoringRules();
        }
    }, [question.id, dimensions]);

    useEffect(() => {
        if (dimensions.length > 0 && formData.dimension_id === 0) {
            setFormData(prev => ({ ...prev, dimension_id: dimensions[0].id }));
        }
    }, [dimensions]);

    const fetchScoringRules = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const allRules: DimensionScoringRule[] = [];
            
            for (const dimension of dimensions) {
                const rules = await dimensionApi.getScoringRules(dimension.id);
                const questionRules = rules.filter(r => r.question_id === question.id);
                allRules.push(...questionRules);
            }
            
            setScoringRules(allRules);
        } catch (err) {
            setError(t('dimensions.scoring.loadingError'));
            console.error('Failed to fetch scoring rules:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getAnswerOptions = (): string[] => {
        switch (question.question_type) {
            case QuestionType.MULTIPLE_CHOICE:
            case QuestionType.CHECKBOX:
            case QuestionType.DROPDOWN:
                return (question.options as QuestionOption[])?.map(opt => opt.value) || [];
                
            case QuestionType.LINEAR_SCALE:
                const scale = question.options as LinearScaleOptions;
                if (!scale) return [];
                
                return Array.from(
                    { length: scale.max_value - scale.min_value + 1 },
                    (_, i) => (scale.min_value + i).toString()
                );
                
            case QuestionType.TEXT:
            default:
                return [];
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.answer_value || !formData.dimension_id) return;

        try {
            setIsLoading(true);
            setError(null);
            
            const ruleData: DimensionScoringRuleCreateInput = {
                dimension_id: formData.dimension_id,
                question_id: question.id,
                answer_value: formData.answer_value,
                score: formData.score
            };
            
            const newRule = await dimensionApi.createScoringRule(ruleData);
            setScoringRules(prev => [...prev, newRule]);
            
            resetForm();
        } catch (err) {
            setError(t('dimensions.scoring.savingError'));
            console.error('Failed to create scoring rule:', err);
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
                setScoringRules(prev => prev.filter(r => r.id !== ruleId));
            } catch (err) {
                setError(t('dimensions.scoring.deletingError'));
                console.error('Failed to delete scoring rule:', err);
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
        setError(null);
    };

    const getDimensionName = (dimensionId: number): string => {
        const dimension = dimensions.find(d => d.id === dimensionId);
        return dimension?.name || t('dimensions.scoring.unknownDimension');
    };

    const getAnswerLabel = (value: string): string => {
        if (question.question_type === QuestionType.LINEAR_SCALE) {
            return value;
        }
        
        const options = question.options as QuestionOption[];
        const option = options?.find(opt => opt.value === value);
        return option?.label || value;
    };

    const updateFormField = <K extends keyof ScoringRuleForm>(
        field: K, 
        value: ScoringRuleForm[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const answerOptions = getAnswerOptions();
    const canAddRule = answerOptions.length > 0;
    const isFormValid = formData.answer_value && formData.dimension_id;

    if (dimensions.length === 0) {
        return (
            <div className={styles.noDimensions}>
                <p>{t('dimensions.scoring.noDimensionsForQuiz')}</p>
            </div>
        );
    }

    if (isLoading && scoringRules.length === 0) {
        return <LoadingIndicator />;
    }

    return (
        <div className={styles.linkContainer}>
            <div className={styles.header}>
                <h4>{t('dimensions.scoring.title')}</h4>
                {!showForm && canAddRule && (
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

            {showForm && canAddRule && (
                <form onSubmit={handleSubmit} className={styles.ruleForm}>
                    <div className={styles.formRow}>
                        <FormField label={t('dimensions.scoring.dimension')} required>
                            <select
                                value={formData.dimension_id}
                                onChange={(e) => updateFormField('dimension_id', parseInt(e.target.value, 10))}
                                required
                                className={styles.dimensionSelect}
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
                                onChange={(e) => updateFormField('answer_value', e.target.value)}
                                required
                                className={styles.answerSelect}
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
                                onChange={(e) => updateFormField('score', parseFloat(e.target.value) || 0)}
                                step="0.1"
                                min="0"
                                max="100"
                                required
                                className={styles.scoreInput}
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
                            disabled={!isFormValid || isLoading}
                            loading={isLoading}
                        >
                            {t('actions.add')}
                        </Button>
                    </div>
                </form>
            )}

            <div className={styles.rulesList}>
                {scoringRules.length === 0 ? (
                    <div className={styles.noRules}>
                        <p>
                            {!canAddRule 
                                ? t('dimensions.scoring.noRulesForTextType')
                                : t('dimensions.scoring.noRules')
                            }
                        </p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
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
                                        <td className={styles.dimensionCell}>
                                            {getDimensionName(rule.dimension_id)}
                                        </td>
                                        <td className={styles.answerCell}>
                                            {getAnswerLabel(rule.answer_value)}
                                        </td>
                                        <td className={styles.scoreCell}>
                                            {rule.score}
                                        </td>
                                        <td className={styles.actionCell}>
                                            <Button
                                                variant="text"
                                                size="small"
                                                icon={<MdDelete size={UI.ICONS.SIZE.SMALL} />}
                                                onClick={() => handleDelete(rule.id)}
                                                title={t('actions.delete')}
                                                className={styles.deleteButton}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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