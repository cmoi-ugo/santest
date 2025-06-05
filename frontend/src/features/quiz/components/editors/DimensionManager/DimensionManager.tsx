import React, { useEffect, useState } from 'react';
import { MdAdd, MdDelete, MdEdit, MdExpandLess, MdExpandMore } from 'react-icons/md';

import { Button, ConfirmDialog, ErrorMessage, FormField, LoadingIndicator } from '@/components/ui';
import { UI } from '@/config';
import { useConfirm, useTranslation } from '@/hooks';

import { dimensionApi } from '../../../api/dimensionApi';
import type { Dimension, DimensionCreateInput } from '../../../types/dimension.types';
import { DimensionAdviceManager } from '../DimensionAdviceEditor/DimensionAdviceEditor';
import styles from './DimensionManager.module.css';

interface DimensionManagerProps {
    quizId: number;
    dimensions?: Dimension[];
    onDimensionsUpdate?: (dimensions: Dimension[]) => void;
}

/**
 * Gestionnaire des dimensions de quiz avec édition intégrée des conseils
 */
export const DimensionManager: React.FC<DimensionManagerProps> = ({ 
    quizId,
    dimensions: propDimensions,
    onDimensionsUpdate 
}) => {
    const { t } = useTranslation();
    const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
    
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
            onDimensionsUpdate?.(data);
        } catch (err) {
            setError(t('dimensions.loadingError'));
            console.error('Failed to fetch dimensions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateDimensions = (newDimensions: Dimension[]) => {
        setDimensions(newDimensions);
        onDimensionsUpdate?.(newDimensions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) return;

        try {
            setIsLoading(true);
            setError(null);
            
            if (editingDimension) {
                const updated = await dimensionApi.update(editingDimension.id, {
                    name: formData.name,
                    description: formData.description
                });
                const newDimensions = dimensions.map(d => d.id === updated.id ? updated : d);
                updateDimensions(newDimensions);
            } else {
                const newDimension = await dimensionApi.create({
                    ...formData,
                    quiz_id: quizId
                });
                updateDimensions([...dimensions, newDimension]);
            }
            
            resetForm();
        } catch (err) {
            setError(t('dimensions.saveError'));
            console.error('Failed to save dimension:', err);
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
        setError(null);
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
                updateDimensions(newDimensions);
                
                // Fermer l'expansion si cette dimension était ouverte
                setExpandedDimensions(prev => {
                    const updated = new Set(prev);
                    updated.delete(id);
                    return updated;
                });
            } catch (err) {
                setError(t('dimensions.deleteError'));
                console.error('Failed to delete dimension:', err);
            }
        }
    };

    const toggleExpanded = (dimensionId: number) => {
        setExpandedDimensions(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(dimensionId)) {
                newExpanded.delete(dimensionId);
            } else {
                newExpanded.add(dimensionId);
            }
            return newExpanded;
        });
    };

    const resetForm = () => {
        setFormData({
            quiz_id: quizId,
            name: '',
            description: ''
        });
        setEditingDimension(null);
        setShowForm(false);
        setError(null);
    };

    const updateFormField = <K extends keyof DimensionCreateInput>(
        field: K, 
        value: DimensionCreateInput[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const isFormValid = formData.name.trim().length > 0;

    if (isLoading && dimensions.length === 0) {
        return <LoadingIndicator />;
    }

    return (
        <div className={styles.dimensionManager}>
            <div className={styles.header}>
                <h3>{t('dimensions.title')}</h3>
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
                            onChange={(e) => updateFormField('name', e.target.value)}
                            placeholder={t('dimensions.namePlaceholder')}
                            required
                            autoFocus
                        />
                    </FormField>
                    
                    <FormField>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateFormField('description', e.target.value)}
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
                            disabled={!isFormValid || isLoading}
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
                    dimensions.map(dimension => {
                        const isExpanded = expandedDimensions.has(dimension.id);
                        
                        return (
                            <div key={dimension.id} className={styles.dimensionWrapper}>
                                <div className={styles.dimensionItem}>
                                    <div className={styles.dimensionContent}>
                                        <h4 className={styles.dimensionName}>{dimension.name}</h4>
                                        {dimension.description && (
                                            <p className={styles.dimensionDescription}>
                                                {dimension.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className={styles.dimensionActions}>
                                        <Button
                                            variant="text"
                                            size="small"
                                            icon={isExpanded ? 
                                                <MdExpandLess size={UI.ICONS.SIZE.MEDIUM} /> : 
                                                <MdExpandMore size={UI.ICONS.SIZE.MEDIUM} />
                                            }
                                            onClick={() => toggleExpanded(dimension.id)}
                                            title={isExpanded ? 
                                                t('dimensions.collapse') : 
                                                t('dimensions.expand')
                                            }
                                        />
                                        <Button
                                            variant="text"
                                            size="small"
                                            icon={<MdEdit size={UI.ICONS.SIZE.MEDIUM} />}
                                            onClick={() => handleEdit(dimension)}
                                            title={t('actions.edit')}
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
                                
                                {isExpanded && (
                                    <div className={styles.adviceSection}>
                                        <DimensionAdviceManager 
                                            dimensionId={dimension.id} 
                                            dimensionName={dimension.name}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
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