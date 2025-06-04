import { useTranslation } from '@/hooks/useTranslation';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '@/features/quiz/types/quiz.types';
import { QuizScoreResult } from '@/features/quiz/types/dimension.types';
import { Card } from '@/components/ui/Card/Card';
import { ScoreBar } from '@/components/ui/ScoreBar/ScoreBar';
import { MenuDropdown, MenuItem } from '@/components/ui/MenuDropdown/MenuDropdown';
import { Button } from '@/components/ui/Button/Button';
import { quizExchangeApi } from '@/features/quiz/api/quizExchangeApi';
import { favoriteApi } from '@/features/quiz/api/favoriteApi';
import styles from './QuizCardItem.module.css';
import { ROUTES, UI } from '@/config';
import { MdMoreVert, MdVisibility, MdDeleteOutline, MdFileDownload, MdFavorite, MdFavoriteBorder } from "react-icons/md";

interface QuizCardItemProps {
  quiz: Quiz;
  mode: 'display' | 'manage' | 'results';
  scoreResult?: QuizScoreResult;
  sessionId?: string;
  onDelete?: (id: number | string) => Promise<void>;
  onView?: (id: number | string) => void;
  onFavoriteChange?: () => void;
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const itemId = mode === 'results' ? sessionId! : quiz.id;

  useEffect(() => {
    if (mode === 'display') {
      checkFavoriteStatus();
    }
  }, [quiz.id]);

  const checkFavoriteStatus = async () => {
    const status = await favoriteApi.checkFavorite(quiz.id);
    setIsFavorite(status);
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

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onView) {
      onView(itemId);
    }
  };

  const handleExportClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    await quizExchangeApi.exportQuizFile(quiz.id, quiz.title);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) {
      onDelete(itemId);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsToggling(true);
      
      if (isFavorite) {
        await favoriteApi.removeFromFavorites(quiz.id);
        setIsFavorite(false);
      } else {
        await favoriteApi.addToFavorites(quiz.id);
        setIsFavorite(true);
      }

      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.unknownDate');
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
      color: '#dc3545'
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
          icon={<MdMoreVert size={UI.ICONS.SIZE.MEDIUM}/>}
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
            {t('quiz.cards.modifiedOn', { date: quiz.updated_at ? formatDate(quiz.updated_at) : t('common.unknownDate') })}
          </span>
        </div>
      )}
      
      {mode === 'results' && scoreResult && (
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>
            {t('quiz.cards.completedOn', { date: formatDate(scoreResult.completion_date) })}
          </span>
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