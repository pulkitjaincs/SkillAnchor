import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page Not Found | SkillAnchor',
    description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center p-5 mx-3" style={{ maxWidth: '600px' }}>
                <div className="mb-4">
                    <span className="fw-bold" style={{ fontSize: '6rem', color: 'var(--primary-100)', textShadow: '0 10px 30px rgba(99, 102, 241, 0.2)' }}>
                        404
                    </span>
                </div>
                <h1 className="fw-bold mb-3" style={{ color: 'var(--text-main)', fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
                    Page Not Found
                </h1>
                <p className="mx-auto mb-4" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px' }}>
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <Link
                    href="/"
                    className="btn px-5 py-3 d-inline-flex align-items-center gap-2"
                    style={{ background: 'var(--text-main)', color: 'var(--bg-body)', borderRadius: '16px', fontWeight: 600, fontSize: '1.05rem', transition: 'transform 0.2s', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                >
                    <i className="bi bi-house-door-fill"></i>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
