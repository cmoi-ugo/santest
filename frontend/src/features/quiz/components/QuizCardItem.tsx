import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '@/features/quiz/types/quiz.types';
import { QuizScoreResult } from '@/features/quiz/types/dimension.types';
import { Card } from '@/components/ui/Card/Card';
import { ScoreBar } from '@/components/ui/ScoreBar/ScoreBar';
import { MenuDropdown, MenuItem } from '@/components/ui/MenuDropdown/MenuDropdown';
import { Button } from '@/components/ui/Button/Button';
import styles from '@/features/quiz/styles/QuizCardItem.module.css';
import { ROUTES, UI } from '@/services/config';
import { MdMoreVert, MdVisibility, MdDeleteOutline } from "react-icons/md";

interface QuizCardItemProps {
  quiz: Quiz;
  mode: 'display' | 'manage' | 'results';
  scoreResult?: QuizScoreResult;
  sessionId?: string;
  onDelete?: (id: number | string) => Promise<void>;
  onView?: (id: number | string) => void;
}

export const QuizCardItem: React.FC<QuizCardItemProps> = ({
  quiz,
  mode,
  scoreResult,
  sessionId,
  onDelete,
  onView
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const itemId = mode === 'results' ? sessionId! : quiz.id;

  const handleCardClick = () => {
    switch (mode) {
      case 'display':
        navigate(ROUTES.QUIZ.TAKE_BY_ID(quiz.id));
        break;
      case 'manage':
        navigate(ROUTES.QUIZ.EDIT_BY_ID(quiz.id));
        break;
      case 'results':
        if (sessionId) navigate(ROUTES.RESULTS.BY_SESSION_ID(sessionId));
        break;
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!menuOpen && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom,
        right: window.innerWidth - rect.right
      });
    }
    
    setMenuOpen(!menuOpen);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onView) {
      onView(itemId);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) {
      onDelete(itemId);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString(UI.LOCALE.DEFAULT, UI.LOCALE.DATE_FORMAT_OPTIONS);
  };

  const calculateAveragePercentage = (result?: QuizScoreResult): number => {
    if (!result?.dimension_scores?.length) return 0;
    
    return result.dimension_scores.reduce(
      (sum, score) => sum + score.percentage, 0
    ) / result.dimension_scores.length;
  };

  const menuItems: MenuItem[] = [
    {
      icon: <MdVisibility size={UI.ICONS.SIZE.SMALL} />,
      label: mode === 'manage' ? 'Voir le quiz' : 'Voir les résultats',
      onClick: handleViewClick
    },
    {
      icon: <MdDeleteOutline size={UI.ICONS.SIZE.SMALL} />,
      label: mode === 'manage' ? 'Supprimer' : 'Supprimer les résultats',
      onClick: handleDeleteClick,
      color: '#dc3545'
    }
  ];

  return (
    <Card
      title={quiz.title}
      imageUrl={quiz.image_url}
      onClick={handleCardClick}
    > 
      {mode === 'results' && scoreResult && (
        <ScoreBar
          percentage={calculateAveragePercentage(scoreResult)}
        />
      )}
      
      {mode === 'manage' && (
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>
            Modifié le {quiz.updated_at ? formatDate(quiz.updated_at) : 'Date inconnue'}
          </span>
        </div>
      )}
      
      {mode === 'results' && scoreResult && (
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>
            Complété le {formatDate(scoreResult.completion_date)}
          </span>
        </div>
      )}
      
      {mode === 'display' ? (
        <Button 
          variant="primary"
          className={styles.reply}
          fullWidth
        >
          Répondre
        </Button>
      ) : (
        <div className={styles.menuContainer}>
          <button 
            ref={menuButtonRef}
            className={styles.menuButton}
            onClick={toggleMenu}
            aria-label="Menu options"
          >
            <MdMoreVert size={UI.ICONS.SIZE.MEDIUM}/>
          </button>
        </div>
      )}
      
      {menuOpen && (
        <MenuDropdown
          items={menuItems}
          position={menuPosition}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </Card>
  );
};