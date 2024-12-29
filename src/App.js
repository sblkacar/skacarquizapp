import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import TakeQuiz from './components/student/TakeQuiz';
import ResultPage from './components/student/ResultPage';
import ResultList from './components/student/ResultList';
import JoinQuiz from './components/student/JoinQuiz';
import QuizManager from './components/teacher/QuizManager';
import MakeQuiz from './components/teacher/MakeQuiz';
import UserManager from './components/admin/UserManager';
import PublicStats from './components/home/PublicStats';
import Footer from './components/common/Footer';
import QuizPreview from './components/teacher/QuizPreview';
import QuizResults from './components/teacher/QuizResults';
import UserProfile from './components/profile/UserProfile';

function App() {
  const currentPath = window.location.pathname;
  const defaultSidebarState = currentPath === '/' ? false : true;
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarState);

  // Auth sayfaları için kontrol
  const isAuthPage = currentPath === '/login' || currentPath === '/register';
  const isPublicStats = currentPath === '/';
  const isLoggedIn = !!localStorage.getItem('token');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // URL değiştiğinde sidebar durumunu güncelle
  useEffect(() => {
    if (currentPath === '/') {
      setSidebarOpen(false);
    }
  }, [currentPath]);

  useEffect(() => {
    // Sayfa kapatıldığında çalışacak fonksiyon
    const handleUnload = (event) => {
      // Sadece tarayıcı/sekme kapatıldığında çalışsın
      if (event.type === 'beforeunload' && !window.performance.navigation.type) {
        localStorage.clear();
      }
    };

    // Sadece beforeunload event'ini dinle
    window.addEventListener('beforeunload', handleUnload);

    // Cleanup fonksiyonu
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <Router>
      <div className={`app ${isAuthPage ? 'auth-page' : ''}`}>
        {/* Navbar auth sayfaları hariç her yerde görünsün */}
        {(!isAuthPage || isPublicStats) && (
          <Navbar 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={sidebarOpen} 
          />
        )}
        
        {/* Sidebar sadece giriş yapılmışsa ve auth sayfalarında değilse görünsün */}
        {!isAuthPage && isLoggedIn && (
          <Sidebar 
            isOpen={sidebarOpen} 
          />
        )}
        
        {/* Ana içerik */}
        <div className={`main-content ${!isAuthPage && !sidebarOpen ? 'expanded' : ''} ${isAuthPage && !isPublicStats ? 'auth-content' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Ana sayfa - giriş yapılmamışsa istatistikleri göster */}
            <Route path="/" element={
              localStorage.getItem('token') ? 
              <Navigate to={`/${JSON.parse(localStorage.getItem('user')).role}/dashboard`} /> : 
              <PublicStats />
            } />

            {/* Protected routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute role="admin">
                <UserManager />
              </ProtectedRoute>
            } />
            
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/student/dashboard" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />

            {/* Quiz rotaları */}
            <Route path="/quiz/:quizId" element={
              <ProtectedRoute role="student">
                <TakeQuiz />
              </ProtectedRoute>
            } />

            <Route path="/student/results" element={
              <ProtectedRoute role="student">
                <ResultList />
              </ProtectedRoute>
            } />

            <Route path="/student/results/:resultId" element={
              <ProtectedRoute role="student">
                <ResultPage />
              </ProtectedRoute>
            } />

            {/* Öğrenci rotaları */}
            <Route path="/student/join-quiz" element={
              <ProtectedRoute role="student">
                <JoinQuiz />
              </ProtectedRoute>
            } />

            {/* Öğretmen rotaları */}
            <Route path="/teacher/quizzes" element={
              <ProtectedRoute role="teacher">
                <QuizManager />
              </ProtectedRoute>
            } />

            <Route path="/teacher/make-quiz" element={
              <ProtectedRoute role="teacher">
                <MakeQuiz />
              </ProtectedRoute>
            } />

            <Route path="/teacher/make-quiz/:quizId" element={
              <ProtectedRoute role="teacher">
                <MakeQuiz />
              </ProtectedRoute>
            } />

            <Route path="/teacher/preview" element={
              <ProtectedRoute role="teacher">
                <QuizPreview />
              </ProtectedRoute>
            } />

            <Route path="/teacher/quiz-results/:quizId" element={
              <ProtectedRoute role="teacher">
                <QuizResults />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
