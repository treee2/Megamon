// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Apartments from './pages/Apartments';
import ApartmentDetails from './pages/ApartmentDetails';
import MyBookings from './pages/MyBookings';
import AddApartment from './pages/AddApartment';
import Profile from './pages/Profile';
import Moderation from './pages/Moderation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// // Компонент для защиты маршрутов - проверяет авторизацию
// function ProtectedRoute({ children }) {
//   const { isAuthenticated } = useAuth();
  
//   // Если пользователь не авторизован, перенаправляем на страницу входа
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
  
//   return children;
// }

// Компонент с маршрутами приложения
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Страница входа доступна только неавторизованным пользователям */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/apartments" replace /> : <Login />
        } 
      />
      
      {/* Главная страница перенаправляет на каталог или на вход */}
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/apartments" : "/login"} replace />
        } 
      />
      
      {/* Защищенные маршруты - доступны только авторизованным пользователям */}
      <Route
        path="/apartments"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Apartments">
              <Apartments />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/apartmentdetails"
        element={
          <ProtectedRoute>
            <Layout currentPageName="ApartmentDetails">
              <ApartmentDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/mybookings"
        element={
          <ProtectedRoute>
            <Layout currentPageName="MyBookings">
              <MyBookings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/addapartment"
        element={
          <ProtectedRoute>
            <Layout currentPageName="AddApartment">
              <AddApartment />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Profile">
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/moderation"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Moderation">
              <Moderation />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;