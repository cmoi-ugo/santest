import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/assets/styles/global.css';
import { ROUTES } from '@/services/config';

// Pages
import HomePage from '@/features/home/pages/HomePage';
import QuizManagePage from '@/features/quiz/pages/QuizManagePage';
import QuizCreatePage from '@/features/quiz/pages/QuizCreatePage';
import QuizEditPage from '@/features/quiz/pages/QuizEditPage';
import QuizTakePage from '@/features/quiz/pages/QuizTakePage'; 
import QuizResultPage from '@/features/quiz/pages/QuizResultPage';
import ResultsHistoryPage from '@/features/quiz/pages/ResultsHistoryPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import QuizImportPage from '@/features/quiz/pages/QuizImportPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.QUIZ.LIST} element={<QuizManagePage />} />
        <Route path={ROUTES.QUIZ.CREATE} element={<QuizCreatePage />} />
        <Route path={ROUTES.QUIZ.EDIT} element={<QuizEditPage />} />
        <Route path={ROUTES.QUIZ.TAKE} element={<QuizTakePage />} />
        <Route path={ROUTES.QUIZ.IMPORT} element={<QuizImportPage />} />
        <Route path={ROUTES.RESULTS.BY_SESSION} element={<QuizResultPage />} />
        <Route path={ROUTES.RESULTS.HISTORY} element={<ResultsHistoryPage />} />
        
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;