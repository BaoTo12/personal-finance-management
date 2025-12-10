import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--bg-dark)] flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                {children}
            </div>

            {/* Right side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] items-center justify-center p-12">
                <div className="text-center text-white max-w-md">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <span className="text-4xl font-bold">M</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                        Manage your finances with ease
                    </h2>
                    <p className="text-white/80 text-lg">
                        Track expenses, set budgets, and gain insights into your spending habits with our powerful financial management platform.
                    </p>
                    <div className="flex justify-center gap-2 mt-8">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                        <div className="w-2 h-2 rounded-full bg-white/40" />
                    </div>
                </div>
            </div>
        </div>
    );
}
