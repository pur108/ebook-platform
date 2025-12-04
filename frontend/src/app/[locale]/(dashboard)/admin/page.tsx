"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    role: string;
}

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (user && user.role === 'admin') {
            // Fetch users (Need endpoint for this, skipping for now or mocking)
            // api.get('/admin/users').then(res => setUsers(res.data));
        }
    }, [user]);

    const handleBan = async (userId: string) => {
        if (confirm('Are you sure you want to ban this user?')) {
            try {
                await api.post(`/admin/users/${userId}/ban`);
                alert('User banned');
            } catch (err) {
                console.error(err);
                alert('Failed to ban user');
            }
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!user || user.role !== 'admin') return <div>Access Denied</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="bg-white rounded shadow p-6">
                <h2 className="text-xl font-bold mb-4">User Management</h2>
                <p className="text-gray-500 mb-4">List of users would appear here.</p>

                {/* Mock List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <span>user@example.com (Creator)</span>
                        <button onClick={() => handleBan('some-uuid')} className="text-red-500 hover:underline">Ban</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
