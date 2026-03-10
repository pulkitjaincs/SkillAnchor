"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center p-5" style={{ background: 'var(--bg-card)', borderRadius: '24px', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                <div className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle"
                    style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)' }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2.5rem', color: '#ef4444' }}></i>
                </div>

                <h2 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Something went wrong!</h2>
                <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                    {error.message || "An unexpected error occurred while loading this page."}
                </p>

                <div className="d-flex gap-3 justify-content-center">
                    <button
                        onClick={() => reset()}
                        className="btn px-4 py-2"
                        style={{ background: 'var(--text-main)', color: 'var(--bg-body)', borderRadius: '12px', fontWeight: 600 }}
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="btn px-4 py-2"
                        style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderRadius: '12px', fontWeight: 600, border: '1px solid var(--border-color)' }}
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
