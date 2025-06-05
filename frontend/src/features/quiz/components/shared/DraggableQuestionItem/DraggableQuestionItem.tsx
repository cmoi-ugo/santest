import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Dimension } from '../../../types/dimension.types';
import type { Question } from '../../../types/question.types';
import { QuestionItem } from '../../editors/QuestionItem/QuestionItem';

interface DraggableQuestionItemProps {
    question: Question;
    index: number;
    onDelete: (questionId: number) => void;
    onSave: (question: Partial<Question>) => void;
    dimensions?: Dimension[];
}

/**
 * Composant question draggable utilisant dnd-kit pour la réorganisation
 */
export const DraggableQuestionItem: React.FC<DraggableQuestionItemProps> = ({
    question,
    index,
    onDelete,
    onSave,
    dimensions
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: question.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <QuestionItem
                question={question}
                index={index}
                onDelete={onDelete}
                onSave={onSave}
                dragHandleProps={{ ...attributes, ...listeners }}
                dimensions={dimensions}
            />
        </div>
    );
};