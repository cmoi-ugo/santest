import React, { useState, useEffect } from 'react';
import { dimensionApi } from '@/features/quiz/api/dimensionApi';
import { Dimension, DimensionCreateInput } from '@/features/quiz/types/dimension.types';
import { DimensionAdviceManager } from '@/features/quiz/components/DimensionAdviceManager';
import styles from '@/features/quiz/styles/DimensionManager.module.css';
import { MdAdd, MdEdit, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { UI } from '@/services/constants';

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
            if (onDimensionsUpdate) {
                onDimensionsUpdate(data);
            }
        } catch (err) {
            setError('Erreur lors du chargement des dimensions');
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
            setError('Erreur lors de l\'enregistrement de la dimension');
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
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dimension ?')) {
            try {
                await dimensionApi.delete(id);
                const newDimensions = dimensions.filter(d => d.id !== id);
                setDimensions(newDimensions);
                if (onDimensionsUpdate) {
                    onDimensionsUpdate(newDimensions);
                }
            } catch (err) {
                setError('Erreur lors de la suppression de la dimension');
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

    return (
        <div className={styles.dimensionManager}>
            <div className={styles.header}>
                <h3>Dimensions d'évaluation</h3>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className={styles.addButton}
                    >
                        <MdAdd size={UI.ICONS.SIZE.SMALL} /> Ajouter une dimension
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.dimensionForm}>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nom de la dimension"
                            required
                            autoFocus
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description (optionnelle)"
                            rows={2}
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
                            disabled={isLoading || !formData.name.trim()}
                            className={styles.submitButton}
                        >
                            {isLoading ? 'Enregistrement...' : (editingDimension ? 'Modifier' : 'Ajouter')}
                        </button>
                    </div>
                </form>
            )}

            <div className={styles.dimensionsList}>
                {dimensions.length === 0 ? (
                    <p className={styles.noDimensions}>Aucune dimension définie</p>
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
                                    <button
                                        onClick={() => toggleExpanded(dimension.id)}
                                        className={styles.actionButton}
                                        title={expandedDimensions.has(dimension.id) ? "Réduire" : "Configurer les conseils"}
                                    >
                                        {expandedDimensions.has(dimension.id) ? 
                                            <MdExpandLess size={UI.ICONS.SIZE.MEDIUM} /> : 
                                            <MdExpandMore size={UI.ICONS.SIZE.MEDIUM} />
                                        }
                                    </button>
                                    <button
                                        onClick={() => handleEdit(dimension)}
                                        className={styles.actionButton}
                                        title="Modifier"
                                    >
                                        <MdEdit size={UI.ICONS.SIZE.MEDIUM} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dimension.id)}
                                        className={styles.actionButton}
                                        title="Supprimer"
                                    >
                                        <MdDelete size={UI.ICONS.SIZE.MEDIUM} />
                                    </button>
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
        </div>
    );
};