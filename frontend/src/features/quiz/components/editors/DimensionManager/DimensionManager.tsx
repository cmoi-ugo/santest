import { useTranslation } from '@/hooks/useTranslation';
import React, { useState, useEffect } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { Button } from '@/components/ui/Button/Button';
import { FormField } from '@/components/ui/FormField/FormField';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { Dimension, DimensionCreateInput } from '@/features/quiz/types/dimension.types';
import { DimensionAdviceManager } from '@/features/quiz/components/editors/DimensionAdviceEditor/DimensionAdviceEditor';
import styles from './DimensionManager.module.css';
import { MdAdd, MdEdit, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { UI } from '@/config';

interface DimensionManagerProps {
    quizId: number;
    dimensions?: Dimension[];
    onDimensionsUpdate?: (dimensions: Dimension[]) => void;
}

export const DimensionManager: React.FC<DimensionManagerProps> = ({ 
    quizId,
    dimensions: propDimensions,
    onDimensionsUpdate 
}) => {
    const { t } = useTranslation();
    const [dimensions, setDimensions] = useState<Dimension[]>(propDimensions || []);
    const [showForm, setShowForm] = useState(false);
    const [editingDimension, setEditingDimension] = useState<Dimension | null>(null);
    const [formData, setFormData] = useState<DimensionCreateInput>({
        quiz_id: quizId,
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedDimensions, setExpandedDimensions] = useState<Set<number>>(new Set());
    const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

    useEffect(() => {
        if (propDimensions) {
            setDimensions(propDimensions);
        } else if (quizId) {
            fetchDimensions();
        }
    }, [quizId, propDimensions]);

    const fetchDimensions = async () => {
        try {
            setIsLoading(true);
            const data = await dimensionApi.getAll(quizId);
            setDimensions(data);
            if (onDimensionsUpdate) {
                onDimensionsUpdate(data);
            }
        } catch (err) {
            setError(t('dimensions.loadingError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsLoading(true);
            if (editingDimension) {
                const updated = await dimensionApi.update(editingDimension.id, {
                    name: formData.name,
                    description: formData.description
                });
                const newDimensions = dimensions.map(d => d.id === updated.id ? updated : d);
                setDimensions(newDimensions);
                if (onDimensionsUpdate) {
                    onDimensionsUpdate(newDimensions);
                }
            } else {
                const newDimension = await dimensionApi.create({
                    ...formData,
                    quiz_id: quizId
                });
                const newDimensions = [...dimensions, newDimension];
                setDimensions(newDimensions);
                if (onDimensionsUpdate) {
                    onDimensionsUpdate(newDimensions);
                }
            }
            
            resetForm();
        } catch (err) {
            setError(t('dimensions.saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (dimension: Dimension) => {
        setEditingDimension(dimension);
        setFormData({
            quiz_id: quizId,
            name: dimension.name,
            description: dimension.description || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        const isConfirmed = await confirm({
            title: t('dimensions.deleteConfirmTitle'),
            message: t('dimensions.deleteConfirmMessage'),
            confirmLabel: t('actions.delete'),
            cancelLabel: t('common.cancel'),
            destructive: true
        });

        if (isConfirmed) {
            try {
                await dimensionApi.delete(id);
                const newDimensions = dimensions.filter(d => d.id !== id);
                setDimensions(newDimensions);
                if (onDimensionsUpdate) {
                    onDimensionsUpdate(newDimensions);
                }
            } catch (err) {
                setError(t('dimensions.deleteError'));
            }
        }
    };

    const toggleExpanded = (dimensionId: number) => {
        const newExpanded = new Set(expandedDimensions);
        if (newExpanded.has(dimensionId)) {
            newExpanded.delete(dimensionId);
        } else {
            newExpanded.add(dimensionId);
        }
        setExpandedDimensions(newExpanded);
    };

    const resetForm = () => {
        setFormData({
            quiz_id: quizId,
            name: '',
            description: ''
        });
        setEditingDimension(null);
        setShowForm(false);
    };

    if (isLoading && dimensions.length === 0) {
        return <LoadingIndicator />;
    }

    return (
        <div className={styles.dimensionManager}>
            <div className={styles.header}>
                {t('dimensions.title')}
                {!showForm && (
                    <Button
                        variant="primary"
                        size="small"
                        icon={<MdAdd size={UI.ICONS.SIZE.MEDIUM} />}
                        onClick={() => setShowForm(true)}
                    >
                        {t('dimensions.addDimension')}
                    </Button>
                )}
            </div>

            {error && <ErrorMessage message={error} />}

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.dimensionForm}>
                    <FormField required>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('dimensions.namePlaceholder')}
                            required
                            autoFocus
                        />
                    </FormField>
                    <FormField>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('dimensions.descriptionPlaceholder')}
                            rows={2}
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
                            disabled={isLoading || !formData.name.trim()}
                            loading={isLoading}
                        >
                            {editingDimension ? t('actions.modify') : t('actions.add')}
                        </Button>
                    </div>
                </form>
            )}

            <div className={styles.dimensionsList}>
                {dimensions.length === 0 ? (
                    <p className={styles.noDimensions}>{t('dimensions.noDimensions')}</p>
                ) : (
                    dimensions.map(dimension => (
                        <div key={dimension.id}>
                            <div className={styles.dimensionItem}>
                                <div className={styles.dimensionContent}>
                                    <h4>{dimension.name}</h4>
                                    {dimension.description && (
                                        <p className={styles.dimensionDescription}>{dimension.description}</p>
                                    )}
                                </div>
                                <div className={styles.dimensionActions}>
                                    <Button
                                        variant="text"
                                        size="small"
                                        icon={expandedDimensions.has(dimension.id) ? 
                                            <MdExpandLess size={UI.ICONS.SIZE.MEDIUM} /> : 
                                            <MdExpandMore size={UI.ICONS.SIZE.MEDIUM} />
                                        }
                                        onClick={() => toggleExpanded(dimension.id)}
                                        title={expandedDimensions.has(dimension.id) ? t('dimensions.collapse') : t('dimensions.expand')}
                                    />
                                    <Button
                                        variant="text"
                                        size="small"
                                        icon={<MdEdit size={UI.ICONS.SIZE.MEDIUM} />}
                                        onClick={() => handleEdit(dimension)}
                                        title={t('actions.modify')}
                                    />
                                    <Button
                                        variant="text"
                                        size="small"
                                        icon={<MdDelete size={UI.ICONS.SIZE.MEDIUM} />}
                                        onClick={() => handleDelete(dimension.id)}
                                        title={t('actions.delete')}
                                    />
                                </div>
                            </div>
                            {expandedDimensions.has(dimension.id) && (
                                <DimensionAdviceManager 
                                    dimensionId={dimension.id} 
                                    dimensionName={dimension.name}
                                />
                            )}
                        </div>
                    ))
                )}
            </div>

            <ConfirmDialog
                isOpen={isOpen}
                title={options.title || t('common.confirm')}
                message={options.message || t('dimensions.deleteConfirmMessage')}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                destructive={options.destructive}
            />
        </div>
    );
};