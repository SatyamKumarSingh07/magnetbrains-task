import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from '../api/axiosInstance'
import { saveAuth } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(data) {
    setServerError('')
    try {
      const res = await axios.post('/auth/signup', data)
      saveAuth(res.data)
      navigate('/')
    } catch (err) {
      const body = err.response?.data
      const details = body?.errors
      if (Array.isArray(details)) setServerError(body.message + ' — ' + details.map(d => d.msg).join(', '))
      else setServerError(body?.message || 'Signup failed')
    }
  }

  return (
    <div className="min-w-fit min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glass card */}
        <div className="relative overflow-hidden rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md shadow-2xl">
          {/* decorative accent blob (responsive) */}
          <div aria-hidden className="absolute -top-20 -left-20 w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-30 blur-3xl transform rotate-45" />

          <div className="relative p-6 sm:p-8">
            {/* Header */}
    
            {/* Server error */}
            {serverError && (
              <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-800/30 p-3 rounded">
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-200 mb-1">Full name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Your full name"
                  className="w-full rounded-lg bg-white/6 border border-white/10 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">Email</label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                  })}
                  placeholder="you@company.com"
                  className="w-full rounded-lg bg-white/6 border border-white/10 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-200 mb-1">Password</label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  placeholder="Create a password"
                  className="w-full rounded-lg bg-white/6 border border-white/10 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
                {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" id="agree" className="accent-indigo-400 w-4 h-4 rounded" />
                <label htmlFor="agree" className="text-slate-200/85 text-xs sm:text-sm">I agree to the <span className="underline">terms & privacy</span></label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg py-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-95 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            {/* bottom hint */}
            <p className="mt-5 text-center text-xs text-slate-300/80">
              Already have an account? <Link to="/login" className="text-indigo-200 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        {/* small caption below card */}
        <div className="mt-5 text-center text-xs text-slate-300/60">
          Built with ♥ • Taskify
        </div>
      </div>
    </div>
  )
}
