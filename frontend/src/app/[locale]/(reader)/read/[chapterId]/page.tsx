"use client";

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';

interface TextLayer {
    id: string;
    original_text: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    style_json: any;
    type: string;
    translations?: Translation[];
}

interface Translation {
    language_code: string;
    translated_text: string;
}

interface ChapterImage {
    id: string;
    image_url: string;
    order: number;
    text_layers: TextLayer[];
}

interface Chapter {
    id: string;
    title: string;
    images: ChapterImage[];
}

export default function ReaderPage() {
    const { chapterId } = useParams();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [language, setLanguage] = useState('original');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (chapterId) {
            api.get(`/chapters/${chapterId}`)
                .then((res) => {
                    setChapter(res.data);
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [chapterId]);

    const handleTranslate = async (layerId: string, targetLang: string) => {
        try {
            const res = await api.post(`/creator/layers/${layerId}/translate`, { target_lang: targetLang });
            // Update local state with new translation
            setChapter((prev) => {
                if (!prev) return null;
                const newImages = prev.images.map((img) => ({
                    ...img,
                    text_layers: (img.text_layers || []).map((layer) => {
                        if (layer.id === layerId) {
                            return {
                                ...layer,
                                translations: [...(layer.translations || []), res.data],
                            };
                        }
                        return layer;
                    }),
                }));
                return { ...prev, images: newImages };
            });
        } catch (err) {
            console.error("Translation failed", err);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!chapter) return <div className="flex items-center justify-center h-screen">Chapter not found</div>;

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 bg-gray-800 p-4 flex justify-between items-center z-50 shadow-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="text-gray-300 hover:text-white transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h1 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">{chapter.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {language !== 'original' && (
                        <button
                            onClick={() => alert("AI OCR Translation Service coming soon!")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                            <span className="hidden sm:inline">Magic Translate</span>
                        </button>
                    )}
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-gray-700 text-white px-3 py-1 rounded"
                    >
                        <option value="original">Original</option>
                        <option value="en">English</option>
                        <option value="th">Thai</option>
                        <option value="jp">Japanese</option>
                    </select>
                </div>
            </div>

            {/* Reader Content */}
            <div className="pt-16 pb-8 max-w-2xl mx-auto">
                {chapter.images.sort((a, b) => a.order - b.order).map((image) => (
                    <div key={image.id} className="relative w-full">
                        <img src={image.image_url} alt={`Page ${image.order}`} className="w-full h-auto block" />

                        {/* Text Layers */}
                        {(image.text_layers || []).map((layer) => {
                            const translation = layer.translations?.find((t) => t.language_code === language);
                            const displayText = language === 'original' ? layer.original_text : (translation?.translated_text || layer.original_text);
                            const isTranslated = language !== 'original' && !!translation;
                            const showTranslateBtn = language !== 'original' && !translation;

                            return (
                                <div
                                    key={layer.id}
                                    className="absolute flex items-center justify-center text-center p-2"
                                    style={{
                                        left: `${layer.position_x}%`,
                                        top: `${layer.position_y}%`,
                                        width: `${layer.width}%`,
                                        height: `${layer.height}%`,
                                        backgroundColor: layer.type === 'bubble' ? 'white' : 'transparent',
                                        color: 'black',
                                        borderRadius: layer.type === 'bubble' ? '50%' : '0',
                                        // Basic styling, can be enhanced with style_json
                                    }}
                                >
                                    {showTranslateBtn ? (
                                        <button
                                            onClick={() => handleTranslate(layer.id, language)}
                                            className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow"
                                        >
                                            Translate
                                        </button>
                                    ) : (
                                        <span className="text-sm font-comic">{displayText}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
