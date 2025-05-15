import React, { useState, useEffect } from 'react';
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
import styles from '@/features/quiz/styles/QuestionDimensionLink.module.css';
import { MdAdd, MdDelete } from 'react-icons/md';
import { UI } from '@/services/constants';

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

    const fetchScoringRules = async () => {
        try {
            const allRules: DimensionScoringRule[] = [];
            for (const dimension of dimensions) {
                const rules = await dimensionApi.getScoringRules(dimension.id);
                const questionRules = rules.filter(r => r.question_id === question.id);
                allRules.push(...questionRules);
            }
            setScoringRules(allRules);
        } catch (err) {
            setError('Erreur lors du chargement des règles de scoring');
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
            setError('Erreur lors de l\'ajout de la règle de scoring');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (ruleId: number) => {
        try {
            // Note: Vous devrez peut-être ajouter une méthode deleteScoringRule à votre API
            // await dimensionApi.deleteScoringRule(ruleId);
            setScoringRules(scoringRules.filter(r => r.id !== ruleId));
        } catch (err) {
            setError('Erreur lors de la suppression de la règle');
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
        return dimension?.name || 'Dimension inconnue';
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
                Aucune dimension définie pour ce questionnaire
            </div>
        );
    }

    const answerOptions = getAnswerOptions();
    
    return (
        <div className={styles.linkContainer}>
            <div className={styles.header}>
                <h4>Règles de scoring pour cette question</h4>
                {!showForm && answerOptions.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className={styles.addButton}
                    >
                        <MdAdd size={UI.ICONS.SIZE.SMALL} /> Ajouter une règle
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {showForm && answerOptions.length > 0 && (
                <form onSubmit={handleSubmit} className={styles.ruleForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Dimension</label>
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
                        </div>

                        <div className={styles.formGroup}>
                            <label>Réponse</label>
                            <select
                                value={formData.answer_value}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    answer_value: e.target.value 
                                })}
                                required
                            >
                                <option value="">Sélectionner</option>
                                {answerOptions.map(value => (
                                    <option key={value} value={value}>
                                        {getAnswerLabel(value)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Score</label>
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
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={resetForm}
                            className={styles.cancelButton}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.answer_value}
                            className={styles.submitButton}
                        >
                            {isLoading ? 'Ajout...' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            )}

            <div className={styles.rulesList}>
                {scoringRules.length === 0 ? (
                    <p className={styles.noRules}>
                        {answerOptions.length === 0 
                            ? 'Les questions de type texte ne peuvent pas avoir de règles de scoring automatiques'
                            : 'Aucune règle de scoring définie'
                        }
                    </p>
                ) : (
                    <table className={styles.rulesTable}>
                        <thead>
                            <tr>
                                <th>Dimension</th>
                                <th>Réponse</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scoringRules.map(rule => (
                                <tr key={rule.id}>
                                    <td>{getDimensionName(rule.dimension_id)}</td>
                                    <td>{getAnswerLabel(rule.answer_value)}</td>
                                    <td>{rule.score}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className={styles.deleteButton}
                                            title="Supprimer"
                                        >
                                            <MdDelete size={UI.ICONS.SIZE.SMALL} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};