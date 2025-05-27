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
    DimensionAdvice, 
    DimensionAdviceCreateInput,
    DimensionAdviceUpdateInput 
} from '@/features/quiz/types/dimension.types';
import styles from './DimensionAdviceEditor.module.css';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { UI } from '@/config';

interface DimensionAdviceManagerProps {
    dimensionId: number;
    dimensionName: string;
}

export const DimensionAdviceManager: React.FC<DimensionAdviceManagerProps> = ({ 
    dimensionId, 
    dimensionName 
}) => {
    const { t } = useTranslation();
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
            setError(t('dimensions.advice.errors.loading'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.max_score <= formData.min_score) {
            setError(t('dimensions.advice.errors.maxGreaterThanMin'));
            return;
        }

        const overlapping = advices.find(advice => {
            if (editingAdvice && advice.id === editingAdvice.id) return false;
            return (formData.min_score < advice.max_score && formData.max_score > advice.min_score);
        });

        if (overlapping) {
            setError(t('dimensions.advice.errors.overlapping'));
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
            setError(t('dimensions.advice.errors.saving'));
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
            title: t('dimensions.advice.deleteConfirmTitle'),
            message: t('dimensions.advice.deleteConfirmMessage'),
            confirmLabel: t('actions.delete'),
            cancelLabel: t('common.cancel'),
            destructive: true
        });

        if (isConfirmed) {
            try {
                await dimensionApi.deleteAdvice(id);
                setAdvices(advices.filter(a => a.id !== id));
            } catch (err) {
                setError(t('dimensions.advice.errors.deleting'));
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
                <h4>{t('dimensions.advice.title', { dimensionName })}</h4>
                {!showForm && (
                    <Button 
                        variant="primary" 
                        size="small"
                        icon={<MdAdd size={UI.ICONS.SIZE.MEDIUM} />}
                        onClick={() => setShowForm(true)}
                    >
                        {t('dimensions.advice.addAdvice')}
                    </Button>
                )}
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.adviceForm}>
                    <div className={styles.formRow}>
                        <FormField label={t('dimensions.advice.minScore')} required>
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

                        <FormField label={t('dimensions.advice.maxScore')} required>
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

                        <FormField label={t('dimensions.advice.level')}>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    severity: e.target.value as 'info' | 'warning' | 'danger'
                                })}
                            >
                                <option value="info">{t('dimensions.advice.severity.info')}</option>
                                <option value="warning">{t('dimensions.advice.severity.warning')}</option>
                                <option value="danger">{t('dimensions.advice.severity.danger')}</option>
                            </select>
                        </FormField>
                    </div>

                    <FormField label={t('dimensions.advice.titleLabel')} required>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t('dimensions.advice.titlePlaceholder')}
                            required
                        />
                    </FormField>

                    <FormField label={t('dimensions.advice.adviceLabel')} required>
                        <textarea
                            value={formData.advice}
                            onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                            placeholder={t('dimensions.advice.advicePlaceholder')}
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
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            loading={isLoading}
                        >
                            {editingAdvice ? t('actions.modify') : t('actions.add')}
                        </Button>
                    </div>
                </form>
            )}

            <div className={styles.advicesList}>
                {advices.length === 0 ? (
                    <p className={styles.noAdvices}>{t('dimensions.advice.noAdvices')}</p>
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
                title={options.title || t('dimensions.advice.deleteConfirmTitle')}
                message={options.message || t('dimensions.advice.deleteConfirmMessage')}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                destructive={options.destructive}
            />
        </div>
    );
};