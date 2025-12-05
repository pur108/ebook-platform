"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useAuthModal } from "@/context/auth-modal-context";
import Link from "@/components/link";
import { useClientTranslation, useClientLocale } from "@/hooks/use-client-translation";
import { useLocaleContext } from "@/context/locale-context";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { openModal } = useAuthModal();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = useClientTranslation('Navbar');
    const locale = useClientLocale();
    const { setLocale } = useLocaleContext();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (newLocale: 'en' | 'th') => {
        setLocale(newLocale);
        setIsDropdownOpen(false);
    };

    return (
        <nav className="bg-[#f9f8f4] dark:bg-gray-800 shadow px-16 py-4 flex justify-between items-center relative z-40">
            <Link href="/" className=" text-2xl font-bold text-[#c9e6ed]">Logo</Link>
            <div className="flex items-center space-x-4">

                {user ? (
                    <>
                        {user.role === 'user' || user.role === 'creator' ? (
                            <>
                                <Link href="/publish/series" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 mr-4 hidden md:block">
                                    {t('publishSeries')}
                                </Link>
                                <Link href="/creator" className="text-indigo-600 hover:underline mr-4 hidden md:block">{t('dashboard')}</Link>
                            </>
                        ) : null}
                        {user.role === 'admin' ? (
                            <Link href="/admin" className="text-red-600 hover:underline mr-4 hidden md:block">Admin</Link>
                        ) : null}

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center focus:outline-none"
                            >
                                {user.profile_image ? (
                                    <img
                                        src={user.profile_image}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 hover:border-indigo-300 transition"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-100 hover:border-indigo-300 transition">
                                        {user.email.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-100 origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Profile
                                    </Link>

                                    {/* Language Switcher in Dropdown */}
                                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Interface Language</p>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleLanguageChange('en')}
                                                className={`flex-1 px-2 py-1 text-xs rounded border text-center ${locale === 'en' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                English
                                            </button>
                                            <button
                                                onClick={() => handleLanguageChange('th')}
                                                className={`flex-1 px-2 py-1 text-xs rounded border text-center ${locale === 'th' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                ไทย
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            {t('logout')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => openModal('login')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                        {t('login')} / {t('signup')}
                    </button>
                )}
            </div>
        </nav>
    );
}