import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import './index.css';
import Layout from '../components/layout';
import Home from '../components/pages/Home/Home';
import SignUp from '../components/pages/Auth/SignUp';
import Login from '../components/pages/Auth/Login';
import Reset from '../components/pages/Auth/Reset';
import Error404 from '../components/Error404';
import Error403 from '../components/Error403';
import ManageGames from '../components/pages/Games/ManageGames';
import GamePerformance from '../components/pages/Games/GamePerformance';
import MyWishlist from '../components/pages/Games/MyWishlist';
import MyGames from '../components/pages/Games/MyGames';
import SelectedGame from '../components/pages/Games/SelectedGame';
import Search from '../components/pages/Games/SearchGame';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<Reset />} />
            <Route path="/manage-games" element={
              <ProtectedRoute userType="developer">
                <ManageGames />
              </ProtectedRoute>
            } />
            <Route path="/game-performance" element={
              <ProtectedRoute userType="developer">
                <GamePerformance />
              </ProtectedRoute>
            } />
            <Route path="/game/:id" element={<SelectedGame />} />
            <Route path="/my-wishlist" element={
              <ProtectedRoute userType="customer">
                <MyWishlist />
              </ProtectedRoute>
            } />
            <Route path="/my-games" element={
              <ProtectedRoute userType="customer">
                <MyGames />
              </ProtectedRoute>
            } />
            <Route path="/search" element={<Search />} />
            <Route path="/error403" element={<Error403 />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;