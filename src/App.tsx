import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RecordListPage } from './pages/RecordListPage';
import { RecordBulkCreatePage } from './pages/RecordBulkCreatePage';
import { RecordDetailPage } from './pages/RecordDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { BestsPage } from './pages/BestsPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { RecordEditPage } from './pages/RecordEditPage';
import { UserRegisterPage } from './pages/UserRegisterPage';
import { UserRegisterSentPage } from './pages/UserRegisterSentPage';
import { UserVerifyPage } from './pages/UserVerifyPage';
import './index.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
            <Route
              path="/records"
              element={
                <PrivateRoute>
                  <RecordListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/bulk-create"
              element={
                <PrivateRoute>
                  <RecordBulkCreatePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/:id"
              element={
                <PrivateRoute>
                  <RecordDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/:id/edit"
              element={
                <PrivateRoute>
                  <RecordEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/bests"
              element={
                <PrivateRoute>
                  <BestsPage />
                </PrivateRoute>
              }
            />
            <Route path="/register" element={<UserRegisterPage />} />
            <Route path="/register/sent" element={<UserRegisterSentPage />} />
            <Route path="/verify-email" element={<UserVerifyPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;