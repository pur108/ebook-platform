"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "@/components/link";
import api from "@/lib/api";
import { useClientLocale } from "@/hooks/use-client-translation";

interface MultilingualText {
    en: string;
    th: string;
}

interface Chapter {
    id: string;
    chapter_number: number;
    title: string;
    status: string;
    published_at: string;
}

interface Season {
    id: string;
    season_number: number;
    title: string;
    chapters: Chapter[];
}

interface Series {
    id: string;
    title: MultilingualText;
    subtitle: MultilingualText;
    description: MultilingualText;
    author: string;
    genres: string[];
    tags: MultilingualText[];
    thumbnail_url: string;
    cover_image_url: string;
    banner_image_url: string;
    status: string;
    seasons: Season[];
}

export default function SeriesDetailPage() {
    const { id } = useParams();
    const [series, setSeries] = useState<Series | null>(null);
    const [loading, setLoading] = useState(true);
    const locale = useClientLocale();

    const getLocalizedText = (text: MultilingualText | string) => {
        if (typeof text === 'string') return text;
        if (!text) return "";
        return text[locale as keyof MultilingualText] || text.en || "";
    };

    useEffect(() => {
        if (id) {
            api.get(`/series/${id}`)
                .then((res) => {
                    setSeries(res.data);
                })
                .catch((err) => {
                    console.error("Failed to fetch series", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <h1 className="text-2xl font-bold mb-4">Series Not Found</h1>
                <Link href="/" className="text-indigo-600 hover:underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans pb-20 relative">
            {/* Back Button */}
            <button
                onClick={() => window.history.back()}
                className="absolute top-4 left-4 z-30 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition backdrop-blur-sm"
                aria-label="Go back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>

            {/* Banner */}
            <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent z-10 opacity-80"></div>
                <img
                    src={series.banner_image_url || series.cover_image_url}
                    alt="Banner"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-20">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover Image */}
                    <div className="shrink-0 mx-auto md:mx-0">
                        <img
                            src={series.cover_image_url}
                            alt={getLocalizedText(series.title)}
                            className="w-48 h-64 md:w-64 md:h-80 object-cover rounded-lg shadow-xl border-4 border-white dark:border-gray-800"
                        />
                    </div>

                    {/* Info */}
                    <div className="grow pt-4 md:pt-32 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-white md:text-gray-900 md:dark:text-white mt-4 mb-2 shadow-black md:shadow-none drop-shadow-md md:drop-shadow-none">
                            {getLocalizedText(series.title)}
                        </h1>
                        <p className="text-lg text-gray-200 md:text-gray-600 md:dark:text-gray-300 mb-4 font-medium">
                            {getLocalizedText(series.description)}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                            {series.genres?.map((genre) => (
                                <span key={genre} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">
                                    {genre}
                                </span>
                            ))}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${series.status === 'ongoing' ? 'border-green-500 text-green-600' :
                                series.status === 'completed' ? 'border-blue-500 text-blue-600' :
                                    'border-gray-500 text-gray-600'
                                }`}>
                                {series.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 mb-8">
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold">Author:</span> {series.author}
                            </p>
                            {series.tags && series.tags.length > 0 && (
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Tags:</span> {series.tags.map(t => getLocalizedText(t)).join(", ")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chapters List */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">Chapters</h2>

                    {series.seasons && series.seasons.length > 0 ? (
                        <div className="space-y-8">
                            {series.seasons.sort((a, b) => a.season_number - b.season_number).map((season) => (
                                <div key={season.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                        <h3 className="font-bold text-lg">
                                            {season.title || `Season ${season.season_number}`}
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {season.chapters && season.chapters.length > 0 ? (
                                            season.chapters.sort((a, b) => a.chapter_number - b.chapter_number).map((chapter) => (
                                                <Link
                                                    key={chapter.id}
                                                    href={`/read/${chapter.id}`}
                                                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex justify-between items-center group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-gray-400 font-mono w-8">#{chapter.chapter_number}</span>
                                                        <span className="font-medium group-hover:text-indigo-600 transition">
                                                            {chapter.title || `Chapter ${chapter.chapter_number}`}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(chapter.published_at).toLocaleDateString()}
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="px-6 py-8 text-center text-gray-500">
                                                No chapters available in this season.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500">
                            No chapters available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
