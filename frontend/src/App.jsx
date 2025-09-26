import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TaskDetail from './pages/TaskDetail'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div className="min-h-screen antialiased text-slate-900 bg-black">
      <header className="bg-red-300/80 backdrop-blur sticky top-0 z-30 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/login" className="text-xl font-bold tracking-tight text-slate-800 hover:text-blue-900">TaskiFYY</Link>
          <nav className="space-x-4">
            <Link to="/login" className="text-md font-bold text-slate-900 hover:text-blue-900">Login</Link>
            <Link to="/signup" className="text-md font-bold text-slate-900 hover:text-blue-900">Signup</Link>
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
