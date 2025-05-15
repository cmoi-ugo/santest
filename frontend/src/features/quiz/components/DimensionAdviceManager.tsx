import React, { useState, useEffect } from 'react';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { 
    DimensionAdvice, 
    DimensionAdviceCreateInput,
    DimensionAdviceUpdateInput 
} from '@/features/quiz/types/dimension.types';
import styles from '@/features/quiz/styles/DimensionAdviceManager.module.css';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { UI } from '@/services/constants';

interface DimensionAdviceManagerProps {
    dimensionId: number;
    dimensionName: string;
}

export const DimensionAdviceManager: React.FC<DimensionAdviceManagerProps> = ({ 
    dimensionId, 
    dimensionName 
}) => {
    const [advices, setAdvices] = useState<DimensionAdvice[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAdvice, setEditingAdvice] = useState<DimensionAdvice | null>(null);
    const [formData, setFormData] = useState<DimensionAdviceCreateInput>({
        dimension_id: dimensionId,
        min_score: 0,
        max_score: 100,
        title: '',
        advice: '',
        severity: 'info'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAdvices();
    }, [dimensionId]);

    const fetchAdvices = async () => {
        try {
            setIsLoading(true);
            const data = await dimensionApi.getAdvices(dimensionId);
            setAdvices(data.sort((a, b) => a.min_score - b.min_score));
        } catch (err) {
            setError('Erreur lors du chargement des conseils');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.max_score <= formData.min_score) {
            setError('Le score maximum doit être supérieur au score minimum');
            return;
        }

        const overlapping = advices.find(advice => {
            if (editingAdvice && advice.id === editingAdvice.id) return false;
            return (formData.min_score < advice.max_score && formData.max_score > advice.min_score);
        });

        if (overlapping) {
            setError('Cette plage de scores chevauche avec un conseil existant');
            return;
        }

        try {
            setIsLoading(true);
            if (editingAdvice) {
                const updateData: DimensionAdviceUpdateInput = {
                    min_score: formData.min_score,
                    max_score: formData.max_score,
                    title: formData.title,
                    advice: formData.advice,
                    severity: formData.severity
                };
                const updated = await dimensionApi.updateAdvice(editingAdvice.id, updateData);
                setAdvices(advices.map(a => a.id === updated.id ? updated : a).sort((a, b) => a.min_score - b.min_score));
            } else {
                const newAdvice = await dimensionApi.createAdvice(formData);
                setAdvices([...advices, newAdvice].sort((a, b) => a.min_score - b.min_score));
            }
            
            resetForm();
        } catch (err) {
            setError('Erreur lors de l\'enregistrement du conseil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (advice: DimensionAdvice) => {
        setEditingAdvice(advice);
        setFormData({
            dimension_id: dimensionId,
            min_score: advice.min_score,
            max_score: advice.max_score,
            title: advice.title,
            advice: advice.advice,
            severity: advice.severity
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce conseil ?')) {
            try {
                await dimensionApi.deleteAdvice(id);
                setAdvices(advices.filter(a => a.id !== id));
            } catch (err) {
                setError('Erreur lors de la suppression du conseil');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            dimension_id: dimensionId,
            min_score: 0,
            max_score: 100,
            title: '',
            advice: '',
            severity: 'info'
        });
        setEditingAdvice(null);
        setShowForm(false);
        setError(null);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'info': return '#2196F3';
            case 'warning': return '#FF9800';
            case 'danger': return '#F44336';
            default: return '#2196F3';
        }
    };

    const getSeverityLabel = (severity: string) => {
        switch (severity) {
            case 'info': return 'Information';
            case 'warning': return 'Avertissement';
            case 'danger': return 'Danger';
            default: return severity;
        }
    };

    return (
        <div className={styles.adviceManager}>
            <div className={styles.header}>
                <h4>Conseils pour {dimensionName}</h4>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className={styles.addButton}
                    >
                        <MdAdd size={UI.ICONS.SIZE.SMALL} /> Ajouter un conseil
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.adviceForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Score minimum (%)</label>
                            <input
                                type="number"
                                value={formData.min_score}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    min_score: parseFloat(e.target.value) || 0 
                                })}
                                min={0}
                                max={100}
                                step={0.1}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Score maximum (%)</label>
                            <input
                                type="number"
                                value={formData.max_score}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    max_score: parseFloat(e.target.value) || 0 
                                })}
                                min={0}
                                max={100}
                                step={0.1}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Niveau</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    severity: e.target.value as 'info' | 'warning' | 'danger'
                                })}
                            >
                                <option value="info">Information</option>
                                <option value="warning">Avertissement</option>
                                <option value="danger">Danger</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Titre</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Très bon score"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Conseil</label>
                        <textarea
                            value={formData.advice}
                            onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                            placeholder="Ex: Votre score indique que vous êtes sur la bonne voie..."
                            rows={3}
                            required
                        />
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
                            disabled={isLoading}
                            className={styles.submitButton}
                        >
                            {isLoading ? 'Enregistrement...' : (editingAdvice ? 'Modifier' : 'Ajouter')}
                        </button>
                    </div>
                </form>
            )}

            <div className={styles.advicesList}>
                {advices.length === 0 ? (
                    <p className={styles.noAdvices}>Aucun conseil défini</p>
                ) : (
                    <div className={styles.adviceGrid}>
                        {advices.map(advice => (
                            <div key={advice.id} className={styles.adviceItem}>
                                <div className={styles.adviceHeader}>
                                    <div className={styles.scoreRange}>
                                        <span className={styles.scoreLabel}>
                                            {advice.min_score}% - {advice.max_score}%
                                        </span>
                                        <span 
                                            className={styles.severityBadge}
                                            style={{ backgroundColor: getSeverityColor(advice.severity) }}
                                        >
                                            {getSeverityLabel(advice.severity)}
                                        </span>
                                    </div>
                                    <div className={styles.adviceActions}>
                                        <button
                                            onClick={() => handleEdit(advice)}
                                            className={styles.actionButton}
                                            title="Modifier"
                                        >
                                            <MdEdit size={UI.ICONS.SIZE.SMALL} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(advice.id)}
                                            className={styles.actionButton}
                                            title="Supprimer"
                                        >
                                            <MdDelete size={UI.ICONS.SIZE.SMALL} />
                                        </button>
                                    </div>
                                </div>
                                <h5 className={styles.adviceTitle}>{advice.title}</h5>
                                <p className={styles.adviceText}>{advice.advice}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};