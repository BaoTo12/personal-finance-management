"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { toast } from "sonner";

export default function SignInPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate sign in
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success("Welcome back!");
        router.push("/");
        setIsLoading(false);
    };

    return (
        <Card className="w-full max-w-md" padding="lg">
            <CardContent>
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-white">M</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        Welcome back
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        leftIcon={<Mail className="w-4 h-4" />}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            leftIcon={<Lock className="w-4 h-4" />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            }
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={(e) =>
                                    setFormData({ ...formData, rememberMe: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">
                                Remember me
                            </span>
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-[var(--primary)] hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Sign In
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border-color)]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-[var(--bg-card)] px-4 text-[var(--text-muted)]">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Social Login */}
                <Button variant="outline" className="w-full" type="button">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/sign-up"
                        className="text-[var(--primary)] hover:underline font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
