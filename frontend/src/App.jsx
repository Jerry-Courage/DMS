import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CompaniesPage from './pages/CompaniesPage'
import CompanyFormPage from './pages/CompanyFormPage'
import CompanyDetailPage from './pages/CompanyDetailPage'
import UsersPage from './pages/UsersPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-dark-900 text-white">Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/new" element={<CompanyFormPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="companies/:id/edit" element={<CompanyFormPage />} />
        <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e1e1e', color: '#e5e5e5', border: '1px solid #3a3a3a' },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  )
}
