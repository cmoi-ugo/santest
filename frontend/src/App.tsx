import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/assets/styles/global.css';
import { ROUTES } from '@/config';

// Pages
import HomePage from '@/features/quiz/pages/QuizListPage/QuizListPage';
import QuizManagePage from '@/features/quiz/pages/QuizManagePage/QuizManagePage';
import QuizCreatePage from '@/features/quiz/pages/QuizCreatePage/QuizCreatePage';
import QuizEditPage from '@/features/quiz/pages/QuizEditPage/QuizEditPage';
import QuizTakePage from '@/features/quiz/pages/QuizTakePage/QuizTakePage'; 
import QuizResultPage from '@/features/quiz/pages/QuizResultPage/QuizResultPage';
import ResultsHistoryPage from '@/features/quiz/pages/ResultsHistoryPage/ResultsHistoryPage';
import FavoritesPage from '@/features/quiz/pages/FavoritePage/FavoritesPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import QuizImportPage from '@/features/quiz/pages/QuizImportPage/QuizImportPage';
import AboutPage from '@/features/about/pages/AboutPage';

import { LanguageProvider } from '@/context/LanguageContext';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { FirstVisitRedirect } from '@/components/FirstVisitRedirect';

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