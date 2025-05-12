import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { quizApi } from '@/features/quiz/api/quizApi';
import { Quiz } from '@/features/quiz/types/quiz.types';
import styles from '@/features/quiz/components/QuizCards.module.css';
import { getImagePath } from '@/utils/imageUtils';
import { ASSETS, ROUTES, MESSAGES, UI } from '@/config/constants';
import { MdAdd, MdMoreVert, MdDeleteOutline, MdVisibility } from "react-icons/md";

interface QuizCardsProps {
  mode: 'display' | 'manage';  // 'display' pour HomePage, 'manage' pour QuizEditPage
}

export const QuizCards: React.FC<QuizCardsProps> = ({ mode }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonsRef = useRef<Record<number, HTMLButtonElement | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const data = await quizApi.getAll();
        setQuizzes(data);
        setError(null);
      } catch (err) {
        setError(MESSAGES.ERROR.FORM.QUIZ_LOADING);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (mode === 'manage') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [mode]);

  const handleCardClick = (id: number) => {
    if (mode === 'display') {
      navigate(ROUTES.QUIZ.TAKE(id));
    } else {
      navigate(ROUTES.QUIZ.EDIT_BY_ID(id));
    }
  };

  const handleMenuClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    if (activeMenu === id) {
      setActiveMenu(null);
    } else {
      setActiveMenu(id);
      
      const buttonElement = menuButtonsRef.current[id];
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom,
          right: window.innerWidth - rect.right
        });
      }
    }
  };

  const handleCreate = () => {
    navigate(ROUTES.QUIZ.CREATE);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveMenu(null);
    
    if (window.confirm(MESSAGES.CONFIRM.DELETE_QUIZ)) {
      try {
        await quizApi.delete(id);
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      } catch (err) {
        setError(MESSAGES.ERROR.FORM.QUIZ_DELETING);
        console.error(err);
      }
    }
  };

  const handleView = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveMenu(null);
    navigate(ROUTES.QUIZ.TAKE(id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(UI.LOCALE.DEFAULT, UI.LOCALE.DATE_FORMAT_OPTIONS);
  };
  
  const getDefaultImagePath = (): string => {
    return getImagePath(ASSETS.DEFAULT_IMAGES.QUIZ);
  };

  if (isLoading) return <div className={styles.loadingMessage}>{MESSAGES.UI.LOADING}</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  if (quizzes.length === 0 && mode === 'display') {
    return (
      <div className={styles.emptyState}>
        <p>Aucun questionnaire disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className={styles.quizCards}>
      <div className={styles.cardsGrid}>
        {mode === 'manage' && (
          <div 
            className={styles.card}
            onClick={() => handleCreate()}
          >
            <div className={`${styles.cardImageContainer} ${styles.addIconContainer}`}>
              <MdAdd />
            </div>
            <div className={styles.cardContent}>
              <h3>Ajouter un questionnaire</h3>
            </div>
          </div>
        )}
        
        {quizzes.map(quiz => (
          <div 
            key={quiz.id} 
            className={styles.card}
            onClick={() => handleCardClick(quiz.id)}
          >
            <div className={styles.cardImageContainer}>
              <img 
                src={getImagePath(quiz.image_url) || getDefaultImagePath()}
                alt={quiz.title}
                className={styles.cardImage}
                onError={(e) => {
                  e.currentTarget.src = getDefaultImagePath();
                }}
              />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{quiz.title}</h3>
              
              {mode === 'display' && quiz.description && (
                <p className={styles.cardDescription}>{quiz.description}</p>
              )}
              
              {mode === 'manage' && (
                <div className={styles.cardMeta}>
                  <span className={styles.cardDate}>
                    {quiz.updated_at ? formatDate(quiz.updated_at) : MESSAGES.UI.UNKNOWN_DATE}
                  </span>
                </div>
              )}
              
              {mode === 'display' ? (
                <button className={styles.startButton}>
                  Commencer le quiz
                </button>
              ) : (
                <div className={styles.menuContainer}>
                  <button 
                    className={styles.menuButton}
                    onClick={(e) => handleMenuClick(e, quiz.id)}
                    aria-label="Menu options"
                    ref={(el) => {
                      menuButtonsRef.current[quiz.id] = el;
                    }}
                  >
                    <MdMoreVert size={UI.ICONS.SIZE.MEDIUM}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Menu déroulant pour le mode manage */}
      {mode === 'manage' && activeMenu !== null && createPortal(
        <div 
          className={styles.menuDropdown} 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
        >
          <button 
            className={styles.menuItem}
            onClick={(e) => handleView(e, activeMenu)}
          >
            <MdVisibility size={UI.ICONS.SIZE.LARGE}/>
            <span>Voir le quiz</span>
          </button>
          <button 
            className={styles.menuItem}
            onClick={(e) => handleDelete(e, activeMenu)}
          >
            <MdDeleteOutline size={UI.ICONS.SIZE.LARGE}/>
            <span>Supprimer</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};