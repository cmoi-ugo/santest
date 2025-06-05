import React, { useEffect, useRef, useState } from 'react';
import { MdDeleteOutline, MdFavorite, MdFavoriteBorder, MdFileDownload, MdMoreVert, MdVisibility } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { Button, Card, MenuDropdown, ScoreBar } from '@/components/ui';
import type { MenuItem } from '@/components/ui';
import { ROUTES, UI } from '@/config';
import { useTranslation } from '@/hooks';

import { favoriteApi } from '../../../api/favoriteApi';
import { quizExchangeApi } from '../../../api/quizExchangeApi';
import type { QuizScoreResult } from '../../../types/dimension.types';
import type { Quiz } from '../../../types/quiz.types';
import styles from './QuizCardItem.module.css';

interface QuizCardItemProps {
  quiz: Quiz;
  mode: 'display' | 'manage' | 'results';
  scoreResult?: QuizScoreResult;
  sessionId?: string;
  onDelete?: (id: number | string) => Promise<void>;
  onView?: (id: number | string) => void;
  onFavoriteChange?: () => void;
}

/**
 * Carte individuelle de quiz avec actions contextuelles selon le mode
 */
export const QuizCardItem: React.FC<QuizCardItemProps> = ({
  quiz,
  mode,
  scoreResult,
  sessionId,
  onDelete,
  onView,
  onFavoriteChange
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const itemId = mode === 'results' ? sessionId! : quiz.id;

  useEffect(() => {
    if (mode === 'display') {
      checkFavoriteStatus();
    }
  }, [quiz.id, mode]);

  const checkFavoriteStatus = async () => {
    try {
      const status = await favoriteApi.checkFavorite(quiz.id);
      setIsFavorite(status);
    } catch (err) {
      console.error('Failed to check favorite status:', err);
    }
  };

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

  const closeMenu = () => setMenuOpen(false);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    if (onView) {
      onView(itemId);
    }
  };

  const handleExportClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    try {
      await quizExchangeApi.exportQuizFile(quiz.id, quiz.title);
    } catch (err) {
      console.error('Failed to export quiz:', err);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    if (onDelete) {
      onDelete(itemId);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      
      if (isFavorite) {
        await favoriteApi.removeFromFavorites(quiz.id);
        setIsFavorite(false);
      } else {
        await favoriteApi.addToFavorites(quiz.id);
        setIsFavorite(true);
      }

      onFavoriteChange?.();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return t('common.unknownDate');
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(UI.LOCALE.DEFAULT, UI.LOCALE.DATE_FORMAT_OPTIONS);
    } catch (err) {
      return t('common.unknownDate');
    }
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
      label: mode === 'manage' ? t('quiz.cards.viewQuiz') : t('quiz.cards.viewResults'),
      onClick: handleViewClick
    },
    ...(mode === 'manage' ? [{
      icon: <MdFileDownload size={UI.ICONS.SIZE.SMALL} />,
      label: t('quiz.cards.export'),
      onClick: handleExportClick
    }] : []),
    {
      icon: <MdDeleteOutline size={UI.ICONS.SIZE.SMALL} />,
      label: mode === 'manage' ? t('actions.delete') : t('quiz.cards.deleteResults'),
      onClick: handleDeleteClick,
      color: UI.COLORS.DANGER
    }
  ];

  const getCardActions = () => {
    if (mode === 'display') {
      return (
        <Button 
          variant="text"
          onClick={toggleFavorite}
          disabled={isToggling}
          icon={isFavorite 
            ? <MdFavorite size={UI.ICONS.SIZE.MEDIUM} /> 
            : <MdFavoriteBorder size={UI.ICONS.SIZE.MEDIUM} />
          }
          title={isFavorite ? t('quiz.cards.removeFromFavorites') : t('quiz.cards.addToFavorites')}
        />
      );
    }

    if (mode === 'manage' || mode === 'results') {
      return (
        <Button
          ref={menuButtonRef}
          variant="text"
          size="small"
          onClick={toggleMenu}
          icon={<MdMoreVert size={UI.ICONS.SIZE.MEDIUM} />}
          title={t('quiz.cards.menuOptions')}
        />
      );
    }

    return null;
  };

  return (
    <Card
      title={quiz.title}
      imageUrl={quiz.image_url}
      onClick={handleCardClick}
      actions={getCardActions()}
    > 
      {mode === 'results' && scoreResult && (
        <ScoreBar
          percentage={calculateAveragePercentage(scoreResult)}
        />
      )}
      
      {mode === 'manage' && (
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>
            {t('quiz.cards.modifiedOn', { 
              date: formatDate(quiz.updated_at)
            })}
          </span>
        </div>
      )}
      
      {mode === 'results' && scoreResult && (
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>
            {t('quiz.cards.completedOn', { 
              date: formatDate(scoreResult.completion_date) 
            })}
          </span>
        </div>
      )}
      
      {menuOpen && (
        <MenuDropdown
          items={menuItems}
          position={menuPosition}
          onClose={closeMenu}
        />
      )}
    </Card>
  );
};