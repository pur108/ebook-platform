"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enMessages from '../../messages/en.json';
import thMessages from '../../messages/th.json';

type Locale = 'en' | 'th';
type Messages = typeof enMessages;

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    messages: Messages;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children, initialLocale }: { children: ReactNode, initialLocale: Locale }) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);

    useEffect(() => {
        const storedLocale = localStorage.getItem('locale') as Locale;
        if (storedLocale && (storedLocale === 'en' || storedLocale === 'th')) {
            setLocaleState(storedLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        // Optional: Update URL without reload if needed, but for now we focus on content
    };

    const messages = locale === 'th' ? thMessages : enMessages;

    return (
        <LocaleContext.Provider value={{ locale, setLocale, messages: messages as Messages }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocaleContext() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocaleContext must be used within a LocaleProvider');
    }
    return context;
}
