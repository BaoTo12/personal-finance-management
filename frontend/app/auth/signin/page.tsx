'use client';

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Apple, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { useAppStore } from '../../../store';

// Define Validation Schema
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Login data:', data);
    login();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex bg-dark-bg text-white">
      {/* Left Column - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/5 p-12 flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-green-300 rounded-xl flex items-center justify-center text-text-1 font-bold text-xl shadow-lg shadow-primary/20">
              M
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ChiBao.</h1>
          </div>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Manage your <br/>
            <span className="text-primary">finances</span> in one place.
          </h2>
          <p className="text-text-2 text-lg max-w-md">
            Track expenses, manage subscriptions, and gain insights into your spending habits with ChiBao's advanced dashboard.
          </p>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px] opacity-40 pointer-events-none"></div>

        <div className="relative z-10 text-sm text-text-3">
          © 2024 ChiBao Financial. All rights reserved.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-text-2">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-2 uppercase tracking-wide ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={20} className={clsx("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.email ? "text-error" : "text-text-3")} />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    {...register('email')}
                    className={clsx(
                      "w-full h-12 bg-dark-card border rounded-2xl pl-11 pr-4 text-white placeholder:text-text-3 transition-all outline-none",
                      errors.email 
                        ? "border-error focus:border-error focus:ring-1 focus:ring-error" 
                        : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    )}
                  />
                </div>
                {errors.email && <p className="text-xs text-error ml-1 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-2 uppercase tracking-wide ml-1">Password</label>
                <div className="relative">
                  <Lock size={20} className={clsx("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.password ? "text-error" : "text-text-3")} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    {...register('password')}
                    className={clsx(
                      "w-full h-12 bg-dark-card border rounded-2xl pl-11 pr-4 text-white placeholder:text-text-3 transition-all outline-none",
                      errors.password 
                        ? "border-error focus:border-error focus:ring-1 focus:ring-error" 
                        : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    )}
                  />
                </div>
                {errors.password && <p className="text-xs text-error ml-1 font-medium">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-dark-card checked:bg-primary checked:border-primary transition-all cursor-pointer" />
                <span className="text-text-2 group-hover:text-white transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center justify-center w-full h-14 bg-primary hover:bg-primary/90 text-text-1 font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing In...' : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-text-3 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button type="button" className="flex items-center justify-center gap-2 h-12 bg-dark-card border border-white/10 hover:bg-white/5 rounded-2xl text-white font-medium transition-all">
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                 Google
               </button>
               <button type="button" className="flex items-center justify-center gap-2 h-12 bg-dark-card border border-white/10 hover:bg-white/5 rounded-2xl text-white font-medium transition-all">
                 <Apple size={20} className="text-white" />
                 Apple
               </button>
            </div>
          </form>

          <div className="text-center text-text-2">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary font-bold hover:underline">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}