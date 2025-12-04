import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-4xl font-bold mb-4">Not Found</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">Could not find requested resource</p>
            <Link href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                Return Home
            </Link>
        </div>
    );
}
