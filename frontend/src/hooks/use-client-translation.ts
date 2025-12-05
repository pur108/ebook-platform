import { useLocaleContext } from '../context/locale-context';

export function useClientLocale() {
    const { locale } = useLocaleContext();
    return locale;
}

export function useClientTranslation(namespace?: string) {
    const { messages } = useLocaleContext();

    const t = (key: string) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const keys = fullKey.split('.');

        let current: any = messages;
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return fullKey; // Return key if not found
            }
        }

        return current as string;
    };

    return t;
}
