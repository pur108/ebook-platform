"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import Link from 'next/link';

interface Series {
    id: string;
    title: string;
    thumbnail_url: string;
    status: string;
}

export default function CreatorDashboard() {
    const { user, isLoading } = useAuth();
    const [series, setSeries] = useState<Series[]>([]);

    useEffect(() => {
        if (user) {
            // Fetch creator's series
            // Note: We need an endpoint for this. For now, we might not have it implemented in backend yet.
            // Let's assume we have GET /api/creator/series or similar.
            // Actually, we implemented GET /api/series/:id but not list.
            // I'll skip fetching for now or just show empty state.
        }
    }, [user]);

    if (isLoading) return <div>Loading...</div>;
    if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Become a Creator</h1>
                <p className="mt-4">You need to be a creator to access this dashboard.</p>
                <button
                    onClick={() => api.post('/users/become-creator').then(() => window.location.reload())}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
                >
                    Become Creator
                </button>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Creator Dashboard</h1>
                <Link href="/creator/series/new" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    Create New Series
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {series.length === 0 ? (
                    <p className="text-gray-500">You haven't published any series yet.</p>
                ) : (
                    series.map((s) => (
                        <div key={s.id} className="border rounded p-4">
                            <img src={s.thumbnail_url} alt={s.title} className="w-full h-48 object-cover mb-4 rounded" />
                            <h3 className="font-bold text-xl">{s.title}</h3>
                            <p className="text-sm text-gray-500 capitalize">{s.status}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
