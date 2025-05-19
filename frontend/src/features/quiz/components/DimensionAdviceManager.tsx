import React, { useState, useEffect } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { 
    DimensionAdvice, 
    DimensionAdviceCreateInput,
    DimensionAdviceUpdateInput 
} from '@/features/quiz/types/dimension.types';
import styles from '@/features/quiz/styles/DimensionAdviceManager.module.css';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { UI } from '@/services/config';

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
    const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

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
        const isConfirmed = await confirm({
            title: 'Confirmation de suppression',
            message: 'Êtes-vous sûr de vouloir supprimer ce conseil ?',
            confirmLabel: 'Supprimer',
            cancelLabel: 'Annuler',
            destructive: true
        });

        if (isConfirmed) {
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

    if (isLoading && advices.length === 0) {
        return <LoadingIndicator />;
    }

    return (
        <div className={styles.adviceManager}>
            <div className={styles.header}>
                <h4>Conseils pour {dimensionName}</h4>
                {!showForm && (
                    <Button 
                        variant="primary" 
                        size="small"
                        icon={<MdAdd size={UI.ICONS.SIZE.MEDIUM} />}
                        onClick={() => setShowForm(true)}
                    >
                        Ajouter un conseil
                    </Button>
                )}
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.adviceForm}>
                    <div className={styles.formRow}>
                        <FormField label="Score minimum (%)" required>
                            <input
                                type="number"
                                value={formData.min_score}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    min_score: parseFloat(e.target.value) || 0 
                                })}
                                min={0}
                                max={100}
                                step={1}
                                required
                            />
                        </FormField>

                        <FormField label="Score maximum (%)" required>
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
                        </FormField>

                        <FormField label="Niveau">
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
                        </FormField>
                    </div>

                    <FormField label="Titre" required>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Très bon score"
                            required
                        />
                    </FormField>

                    <FormField label="Conseil" required>
                        <textarea
                            value={formData.advice}
                            onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                            placeholder="Ex: Votre score indique que vous êtes sur la bonne voie..."
                            rows={3}
                            required
                        />
                    </FormField>

                    <div className={styles.formActions}>
                        <Button
                            variant="text"
                            onClick={resetForm}
                            type="button"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            loading={isLoading}
                        >
                            {editingAdvice ? 'Modifier' : 'Ajouter'}
                        </Button>
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
                                        <Button
                                            variant="text"
                                            size="small"
                                            icon={<MdEdit size={UI.ICONS.SIZE.MEDIUM} />}
                                            onClick={() => handleEdit(advice)}
                                            className={styles.actionButton}
                                            title="Modifier"
                                        />
                                        <Button
                                            variant="text"
                                            size="small"
                                            icon={<MdDelete size={UI.ICONS.SIZE.MEDIUM} />}
                                            onClick={() => handleDelete(advice.id)}
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            title="Supprimer"
                                        />
                                    </div>
                                </div>
                                <h5 className={styles.adviceTitle}>{advice.title}</h5>
                                <p className={styles.adviceText}>{advice.advice}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={isOpen}
                title={options.title || 'Confirmation'}
                message={options.message || 'Êtes-vous sûr ?'}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                destructive={options.destructive}
            />
        </div>
    );
};