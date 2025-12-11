'use client';

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Apple, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { useAppStore } from '../../../store';

// Define Validation Schema
const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service",
  }),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      terms: false, // Ensure checkbox starts unchecked
    }
  });

  const onSubmit = async (data: SignUpForm) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Sign Up data:', data);
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
            Start your <br/>
            <span className="text-primary">journey</span> with us.
          </h2>
          <p className="text-text-2 text-lg max-w-md">
            Join thousands of users managing their finances smarter, faster, and more securely with ChiBao.
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
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-text-2">Enter your details to get started.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-2 uppercase tracking-wide ml-1">Full Name</label>
                <div className="relative">
                  <User size={20} className={clsx("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.fullName ? "text-error" : "text-text-3")} />
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    {...register('fullName')}
                    className={clsx(
                      "w-full h-12 bg-dark-card border rounded-2xl pl-11 pr-4 text-white placeholder:text-text-3 transition-all outline-none",
                      errors.fullName 
                        ? "border-error focus:border-error focus:ring-1 focus:ring-error" 
                        : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    )}
                  />
                </div>
                {errors.fullName && <p className="text-xs text-error ml-1 font-medium">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-2 uppercase tracking-wide ml-1">Password</label>
                <div className="relative">
                  <Lock size={20} className={clsx("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.password ? "text-error" : "text-text-3")} />
                  <input 
                    type="password" 
                    placeholder="Create a password" 
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

            {/* Terms Checkbox */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-text-2">
                <input 
                  type="checkbox" 
                  id="terms"
                  {...register('terms')}
                  className={clsx(
                    "w-4 h-4 rounded border-white/20 bg-dark-card transition-all cursor-pointer accent-primary",
                    errors.terms && "outline outline-1 outline-error"
                  )}
                />
                <label htmlFor="terms" className="cursor-pointer">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-error font-medium">{errors.terms.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center justify-center w-full h-14 bg-primary hover:bg-primary/90 text-text-1 font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-text-3 text-sm">Or register with</span>
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
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-primary font-bold hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}