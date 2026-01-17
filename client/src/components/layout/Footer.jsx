import React from 'react'
import "./Footer.css"
export default function Footer() {
  return (
    <>
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-brand">
                    &copy; {new Date().getFullYear()} KaamSetu, Inc.
                </div>

                <div className="footer-links">
                    <a className="footer-link" to="/privacy">Privacy</a>
                    <a className="footer-link" to="/terms">Terms</a>
                </div>

                <div className="footer-socials">
                    <i className="fa-brands fa-facebook-f"></i>
                    <i className="fa-brands fa-instagram"></i>
                    <i className="fa-brands fa-x-twitter"></i>
                </div>
            </div>
        </footer>
    </>
  )
}
