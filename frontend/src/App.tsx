import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/assets/styles/global.css';
import HomePage from '@/features/home/pages/HomePage';
import QuizEditPage from '@/features/quiz/pages/QuizEditPage';
import QuizCreatePage from '@/features/quiz/pages/QuizCreatePage';
import QuizUpdatePage from '@/features/quiz/pages/QuizUpdatePage';
import QuizTakePage from '@/features/quiz/pages/QuizTakePage'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/edit" element={<QuizEditPage />} />
        <Route path="/quiz/create" element={<QuizCreatePage />} />
        <Route path="/quiz/edit/:id" element={<QuizUpdatePage />} />
        <Route path="/quiz/:id" element={<QuizTakePage />} />
        
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;