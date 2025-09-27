// frontend/src/App.jsx
import React from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TaskDetail from './pages/TaskDetail'
import ProtectedRoute from './components/ProtectedRoute'

// admin pages
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'

import { getUser, logout } from './utils/auth'

export default function App() {
  const user = getUser()
  const location = useLocation()

  // simple admin guard for routes
  function AdminRoute({ children }) {
    const u = getUser()
    if (!u) return <Navigate to="/admin/login" state={{ from: location }} replace />
    if (u.role !== 'admin') return <Navigate to="/admin/login" state={{ from: location }} replace />
    return children
  }

  return (
    <div className="min-h-screen antialiased text-slate-900 bg-black">
      <header className="bg-white/6 backdrop-blur sticky top-0 z-30 border-b border-white/6">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white/90 hover:text-emerald-400">TaskiFYY</Link>

          <nav className="flex items-center gap-4"> 
            {user ? (
              <>
                <div className="text-sm text-slate-200 hidden sm:block hover:text-amber-400">Hi, <strong>{user.name}</strong></div>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="text-sm font-medium text-white/90 hover:text-emerald-400">Admin Panel</Link>
                    <Link to="/admin/users" className="text-sm font-medium text-white/80 hover:text-emerald-400">Users</Link>
                  </>
                )}

                <button onClick={logout} className="text-sm px-3 py-1 bg-white rounded hover:text-emerald-600 font-semibold">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white">Login</Link>
                <Link to="/signup" className="text-sm font-medium text-white/80 hover:text-white">Signup</Link>
                <Link to="/admin/login" className="text-sm font-medium text-amber-300 hover:underline">Admin Login</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <Routes>
            {/* public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* user-protected */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />

            {/* admin auth and admin-only routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />

            {/* fallback */}
            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
