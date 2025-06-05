import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import '@/assets/styles/global.css';
import { FirstVisitRedirect } from '@/components/FirstVisitRedirect';
import { ROUTES } from '@/config';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AboutPage from '@/features/about/pages/AboutPage';
import FavoritesPage from '@/features/quiz/pages/FavoritePage/FavoritesPage';
import QuizCreatePage from '@/features/quiz/pages/QuizCreatePage/QuizCreatePage';
import QuizEditPage from '@/features/quiz/pages/QuizEditPage/QuizEditPage';
import QuizImportPage from '@/features/quiz/pages/QuizImportPage/QuizImportPage';
import HomePage from '@/features/quiz/pages/QuizListPage/QuizListPage';
import QuizManagePage from '@/features/quiz/pages/QuizManagePage/QuizManagePage';
import QuizResultPage from '@/features/quiz/pages/QuizResultPage/QuizResultPage';
import QuizTakePage from '@/features/quiz/pages/QuizTakePage/QuizTakePage';
import ResultsHistoryPage from '@/features/quiz/pages/ResultsHistoryPage/ResultsHistoryPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';

/**
 * Composant racine de l'application avec routing et providers globaux
 */
function App() {
  return (
    <LanguageProvider>
      <DarkModeProvider>
        <BrowserRouter>
          <FirstVisitRedirect>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              <Route path={ROUTES.QUIZ.MANAGE} element={<QuizManagePage />} />
              <Route path={ROUTES.QUIZ.CREATE} element={<QuizCreatePage />} />
              <Route path={ROUTES.QUIZ.EDIT} element={<QuizEditPage />} />
              <Route path={ROUTES.QUIZ.TAKE} element={<QuizTakePage />} />
              <Route path={ROUTES.QUIZ.IMPORT} element={<QuizImportPage />} />
              <Route path={ROUTES.RESULTS.BY_SESSION} element={<QuizResultPage />} />
              <Route path={ROUTES.RESULTS.HISTORY} element={<ResultsHistoryPage />} />
              <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />
              <Route path={ROUTES.ABOUT} element={<AboutPage />} />
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </FirstVisitRedirect>
        </BrowserRouter>
      </DarkModeProvider>
    </LanguageProvider>
  );
}

export default App;