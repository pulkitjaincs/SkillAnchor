import Link from 'next/link';
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-brand">
                    &copy; {new Date().getFullYear()} SkillAnchor, Inc.
                </div>

                <div className="footer-links">
                    <Link className="footer-link" href="/privacy">Privacy</Link>
                    <Link className="footer-link" href="/terms">Terms</Link>
                </div>

                <div className="footer-socials">
                    <i className="bi bi-facebook"></i>
                    <i className="bi bi-instagram"></i>
                    <i className="bi bi-twitter-x"></i>
                </div>
            </div>
        </footer>
    );
}
