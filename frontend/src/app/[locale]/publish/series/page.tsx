"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { useAuth } from "@/context/auth-context";
import { useClientTranslation, useClientLocale } from "@/hooks/use-client-translation";

export default function PublishSeriesPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const t = useClientTranslation('Series');
    const locale = useClientLocale();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<'en' | 'th'>('en');

    const [formData, setFormData] = useState({
        title: { en: "", th: "" },
        description: { en: "", th: "" },
        author: "",
        genres: [] as string[],
        tags: [] as string[],
        cover_image_url: "",
        banner_image_url: "",
        status: "draft",
        visibility: "public",
        nsfw: false,
        monetization_enabled: false,
        monetization_type: "free",
        default_unlock_type: "free",
    });

    const [genreInput, setGenreInput] = useState("");
    const [tagInput, setTagInput] = useState("");

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'title' || name === 'description') {
            setFormData((prev) => ({
                ...prev,
                [name]: { ...prev[name], [activeTab]: value }
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleAddGenre = () => {
        if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
            setFormData((prev) => ({ ...prev, genres: [...prev.genres, genreInput.trim()] }));
            setGenreInput("");
        }
    };

    const handleRemoveGenre = (genre: string) => {
        setFormData((prev) => ({ ...prev, genres: prev.genres.filter((g) => g !== genre) }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const response = await fetch("http://localhost:8080/api/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload image");
            }

            const data = await response.json();
            setFormData((prev) => ({ ...prev, [field]: data.url }));
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image. Please try again.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Construct payload matching backend expectation
        const payload = {
            ...formData,
            tags: formData.tags.map(tag => ({ en: tag, th: tag })), // Temporary mapping for tags
        };

        try {
            const response = await fetch("http://localhost:8080/api/creator/series", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create series");
            }

            const data = await response.json();
            router.push(`/${locale}/series/${data.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <p className="text-gray-600 dark:text-gray-400">Please login to publish a series.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-16">
                {/* <h1 className="text-3xl font-bold mb-8">{t('create')}</h1> */}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Media Assets */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="p-6">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">{t('mediaAssets')}</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('coverImage')}</label>
                                    <div className="flex flex-col items-center space-y-2">
                                        {formData.cover_image_url ? (
                                            <img src={formData.cover_image_url} alt="Cover Preview" className="w-full aspect-2/3 object-cover border" />
                                        ) : (
                                            <div className="w-full aspect-2/3 bg-gray-100 dark:bg-gray-700 border flex items-center justify-center text-gray-400">
                                                {t('noImage')}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, "cover_image_url")}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('bannerImage')}</label>
                                    <div className="flex flex-col items-center space-y-2">
                                        {formData.banner_image_url ? (
                                            <img src={formData.banner_image_url} alt="Banner Preview" className="w-full aspect-3/1 object-cover border" />
                                        ) : (
                                            <div className="w-full aspect-3/1 bg-gray-100 dark:bg-gray-700 border flex items-center justify-center text-gray-400">
                                                {t('noImage')}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, "banner_image_url")}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                </div>

                            </div>
                        </section>
                    </div>

                    {/* Right Column: Metadata & Settings */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 h-fit">
                        {/* Inner Left: Metadata */}
                        <div className="space-y-8">
                            <section className="p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold">{t('metadata')}</h2>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('en')}
                                            className={`px-3 py-1 text-sm transition ${activeTab === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('th')}
                                            className={`px-3 py-1 text-sm transition ${activeTab === 'th' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                        >
                                            Thai
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('title')} *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            required={activeTab === 'en'}
                                            value={formData.title[activeTab]}
                                            onChange={handleTextChange}
                                            className="w-full px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                            placeholder={activeTab === 'en' ? "Enter title in English" : "Enter title in Thai"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('description')}</label>
                                        <textarea
                                            name="description"
                                            rows={4}
                                            value={formData.description[activeTab]}
                                            onChange={handleTextChange}
                                            className="w-full px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('author')}</label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>

                                    {/* Genres */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('genres')}</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={genreInput}
                                                onChange={(e) => setGenreInput(e.target.value)}
                                                className="flex-1 px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                                placeholder="Add a genre"
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
                                            />
                                            <button type="button" onClick={handleAddGenre} className="px-4 py-2 bg-gray-200 dark:bg-gray-600">{t('add')}</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.genres.map((genre) => (
                                                <span key={genre} className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-sm flex items-center">
                                                    {genre}
                                                    <button type="button" onClick={() => handleRemoveGenre(genre)} className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">&times;</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('tags')}</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                className="flex-1 px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                                placeholder="Add a tag"
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            />
                                            <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-200 dark:bg-gray-600">{t('add')}</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map((tag) => (
                                                <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm flex items-center">
                                                    {tag}
                                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-800">&times;</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Inner Right: Publishing & Monetization */}
                        <div className="space-y-8">
                            {/* Publishing Settings */}
                            <section className="p-6">
                                <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">{t('publishingSettings')}</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('status')}</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="draft">{t('draft')}</option>
                                            <option value="ongoing">{t('ongoing')}</option>
                                            <option value="completed">{t('completed')}</option>
                                            <option value="hiatus">{t('hiatus')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('visibility')}</label>
                                        <select
                                            name="visibility"
                                            value={formData.visibility}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="public">{t('public')}</option>
                                            <option value="private">{t('private')}</option>
                                            <option value="unlisted">{t('unlisted')}</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="nsfw"
                                            id="nsfw"
                                            checked={formData.nsfw}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <label htmlFor="nsfw" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                            {t('nsfw')}
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Monetization Preparation */}
                            <section className="p-6 opacity-75">
                                <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold">{t('monetization')}</h2>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 text-gray-600 dark:text-gray-300">{t('comingSoon')}</span>
                                </div>
                                <div className="grid grid-cols-1 gap-6 pointer-events-none grayscale">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="monetization_enabled"
                                            checked={formData.monetization_enabled}
                                            onChange={handleCheckboxChange}
                                            disabled
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                            {t('enableMonetization')}
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('monetizationType')}</label>
                                        <select
                                            name="monetization_type"
                                            value={formData.monetization_type}
                                            onChange={handleChange}
                                            disabled
                                            className="w-full px-3 py-2 border dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="free">{t('free')}</option>
                                            <option value="premium">{t('premium')}</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {loading ? t('creating') : t('createButton')}
                                </button>
                            </div>
                        </div>
                    </div>


                </form>
            </main>
        </div>
    );
}
