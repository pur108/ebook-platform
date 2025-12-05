"use client";

import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { useClientLocale } from "@/hooks/use-client-translation";
import { ReactNode } from "react";

interface LinkProps extends NextLinkProps {
    children: ReactNode;
    className?: string;
    href: string;
    locale?: string;
}

export default function Link({ children, href, locale, ...props }: LinkProps) {
    const currentLocale = useClientLocale();
    const targetLocale = locale || currentLocale;

    // If href is absolute, return as is
    if (href.startsWith('http')) {
        return <NextLink href={href} {...props}>{children}</NextLink>;
    }

    // Ensure href starts with /
    const path = href.startsWith('/') ? href : `/${href}`;

    // Construct localized path
    // If path already has locale, don't double it (basic check)
    const localizedHref = `/${targetLocale}${path}`;

    return (
        <NextLink href={localizedHref} {...props}>
            {children}
        </NextLink>
    );
}
