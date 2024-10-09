'use client';

import React from 'react';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push('/profile');
        }
    }, [router]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        setMessage("");


        try {
            const res = await fetch("/api/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Login successful!");

                localStorage.setItem("token", data.token);

                router.push('/profile');
            } else {
                setError(true);
                setMessage(data.message || "Login failed.");
            }
        } catch (error) {
            setError(true);
            setMessage("An error occurred. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black text-white flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0">
            <a href="#">
                <div className="font-semibold text-2xl tracking-tighter mx-auto flex items-center gap-2">
                    <div>

                    </div>
                    Welcome Back !
                </div>
            </a>
            <div className="relative mt-12 w-full max-w-lg sm:mt-10">
                <div className="relative -mb-px h-px w-full bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                <div className="mx-5 border dark:border-b-white/50 dark:border-t-white/50 border-b-white/20 sm:border-t-white/20 shadow-[20px_0_20px_20px] shadow-slate-500/10 dark:shadow-white/20 rounded-lg border-white/20 border-l-white/20 border-r-white/20 sm:shadow-sm lg:rounded-xl lg:shadow-none">
                    <div className="flex flex-col p-6">
                        <h3 className="text-xl font-semibold leading-6 tracking-tighter">Login</h3>
                        <p className="mt-1.5 text-sm font-medium text-white/50">
                            Welcome back, enter your credentials to continue.
                        </p>
                    </div>
                    <div className="p-6 pt-0">
                        <form onSubmit={handleSubmit}>
                            <div>
                                <div
                                    className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"
                                        } px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}
                                >
                                    <div className="flex justify-between">
                                        <label
                                            className={`text-xs font-medium ${error
                                                    ? "text-red-500"
                                                    : "text-muted-foreground group-focus-within:text-white text-gray-400"
                                                }`}
                                        >
                                            Email
                                        </label>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""
                                            }`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div
                                    className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"
                                        } px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}
                                >
                                    <div className="flex justify-between">
                                        <label
                                            className={`text-xs font-medium ${error
                                                    ? "text-red-500"
                                                    : "text-muted-foreground group-focus-within:text-white text-gray-400"
                                                }`}
                                        >
                                            Password
                                        </label>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""
                                            }`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-end gap-x-2">
                                <a
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:ring hover:ring-white h-10 px-4 py-2 duration-200"
                                    href="/register"
                                >
                                    Register
                                </a>
                                <button
                                    className="font-semibold hover:bg-black hover:text-white hover:ring hover:ring-white transition duration-300 inline-flex items-center justify-center rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black h-10 px-4 py-2"
                                    type="submit"
                                    disabled={loading} // Disable button during loading
                                >
                                    {loading ? (
                                        <svg
                                            className="animate-spin h-5 w-5 text-black"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 4.5v2m0 11v2m7.09-12.09l-1.414 1.414M4.5 12H7m10.09 7.09l1.414-1.414M4.5 12H7m2.09-7.09L7.09 6.5m7.5 10.09l-1.414-1.414"
                                            />
                                        </svg>
                                    ) : (
                                        "Log in"
                                    )}
                                </button>
                            </div>
                        </form>
                        {message && (
                            <p className={`mt-4 text-center ${error ? "text-red-500" : "text-green-500"}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
