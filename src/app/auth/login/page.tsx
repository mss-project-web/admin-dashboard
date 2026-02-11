"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { handleApiError } from "@/lib/axios/index"; // Explicit index import
import Image from "next/image";
import logo from "../../../../public/Image/LOGO-MSS.png";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    const ATTEMPTS_KEY = '_s_id';
    const LOCKOUT_KEY = '_t_exp';

    const setSecCookie = (name: string, value: string | number, days: number = 1) => {
        const strValue = String(value);
        const encoded = btoa(strValue);
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${encoded}; ${expires}; path=/; SameSite=Strict`;
    };

    const getSecCookie = (name: string): number => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                try {
                    const encoded = c.substring(nameEQ.length, c.length);
                    const decoded = atob(encoded);
                    return parseInt(decoded) || 0;
                } catch {
                    return 0;
                }
            }
        }
        return 0;
    };

    const deleteSecCookie = (name: string) => {
        document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedFailedAttempts = getSecCookie(ATTEMPTS_KEY);
        const lockoutEndpoint = getSecCookie(LOCKOUT_KEY);
        const now = Date.now();

        if (lockoutEndpoint > now) {
            const remainingSeconds = Math.ceil((lockoutEndpoint - now) / 1000);
            setFailedAttempts(storedFailedAttempts);
            setIsLocked(true);
            setLockoutTimer(remainingSeconds);
            startLockoutTimer(remainingSeconds);
        } else {
            if (storedFailedAttempts > 0) {
                setFailedAttempts(storedFailedAttempts);
            }
            if (lockoutEndpoint > 0) {
                deleteSecCookie(LOCKOUT_KEY);
                setIsLocked(false);
            }
        }
    }, []);

    const startLockoutTimer = (duration: number) => {
        setLockoutTimer(duration);

        const timer = setInterval(() => {
            setLockoutTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsLocked(false);
                    setFailedAttempts(0);
                    deleteSecCookie(ATTEMPTS_KEY);
                    deleteSecCookie(LOCKOUT_KEY);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleLockout = () => {
        const LOCK_DURATION = 60;
        const lockoutEndpoint = Date.now() + (LOCK_DURATION * 1000);

        setIsLocked(true);
        setSecCookie(LOCKOUT_KEY, lockoutEndpoint);
        startLockoutTimer(LOCK_DURATION);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isLocked) return;

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail || !cleanPassword) {
            setError("กรุณากรอกอีเมลและรหัสผ่าน");
            return;
        }

        if (!emailRegex.test(cleanEmail)) {
            setError("รูปแบบอีเมลไม่ถูกต้อง");
            return;
        }

        setLoading(true);

        try {
            await authApi.login({ email: cleanEmail, password: cleanPassword });

            setFailedAttempts(0);
            deleteSecCookie(ATTEMPTS_KEY);
            deleteSecCookie(LOCKOUT_KEY);

            window.location.href = "/menu";

        } catch (err: any) {

            const newFailedAttempts = failedAttempts + 1;
            setFailedAttempts(newFailedAttempts);
            setSecCookie(ATTEMPTS_KEY, newFailedAttempts);

            if (newFailedAttempts >= 5) {
                setError("คุณล็อกอินผิดพลาดเกินกำหนด กรุณารอสักครู่");
                handleLockout();
            } else {
                if (err.response && err.response.status === 401) {
                    setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
                } else {
                    const message = handleApiError(err);
                    setError(message);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center 
    bg-gradient-to-br from-sky-100 via-white to-sky-200 
    px-4 py-12 sm:px-6 lg:px-8">

            <div className="w-full max-w-md space-y-8 
        bg-white/80 backdrop-blur-xl
        border border-sky-100
        p-10 shadow-2xl rounded-3xl">

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-14 h-14 flex items-center justify-center shadow-sky-200">
                        <Image src={logo} alt="MSS-Logo" width={100} height={100} />
                    </div>

                    <h2 className="mt-6 text-3xl font-black text-sky-500 tracking-tight">
                        MSS <span className="text-slate-900"> Admin</span>
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

                    <div className="space-y-4">

                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLocked || loading}
                            className="w-full rounded-xl border border-sky-200 
                        px-4 py-3 text-slate-900 placeholder-slate-400
                        focus:border-sky-500 focus:ring-2 focus:ring-sky-400
                        disabled:bg-slate-100 disabled:text-slate-400
                        outline-none transition-all duration-300"
                        />
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                maxLength={15}
                                disabled={isLocked || loading}
                                pattern="^[A-Za-z0-9@#$%^&+=!]*$"
                                placeholder="Password (ไม่เกิน 15 ตัวอักษร)"
                                value={password}
                                onChange={(e) => {
                                    const value = e.target.value.slice(0, 15);
                                    setPassword(value);
                                }}
                                className="w-full rounded-xl border border-sky-200 
                                    px-4 py-3 pr-15 text-slate-900 placeholder-slate-400
                                    focus:border-sky-500 focus:ring-2 focus:ring-sky-400
                                    disabled:bg-slate-100 disabled:text-slate-400
                                    outline-none transition-all duration-300"
                            />

                            <button
                                type="button"
                                disabled={isLocked || loading}
                                onClick={() => setShowPassword(!showPassword)}
                                className="cursor-pointer absolute inset-y-0 right-3 flex items-center text-sky-500 hover:text-sky-600 transition disabled:opacity-50"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className={`text-sm text-center p-3 rounded-xl ${isLocked ? 'bg-orange-50 text-orange-600 font-bold' : 'bg-red-50 text-red-500'}`}>
                            {isLocked ? `ระงับการใช้งานชั่วคราว ${lockoutTimer} วินาที` : error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isLocked}
                        className={`w-full rounded-xl 
                    cursor-pointer bg-gradient-to-r from-sky-500 to-sky-600
                    py-3 text-sm font-semibold text-white
                    shadow-lg shadow-sky-200
                    hover:from-sky-600 hover:to-sky-700
                    hover:shadow-xl hover:scale-[1.02]
                    active:scale-95
                    transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2
                    ${(loading || isLocked) ? "opacity-70 cursor-not-allowed grayscale" : ""}
                `}
                    >
                        {loading ? "กำลังตรวจสอบ..." : isLocked ? `รอสักครู่ (${lockoutTimer}s)` : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
