import { useState, useEffect, useRef } from "react";

const Navbar = ({ name }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [theme, setTheme] = useState("system"); // system, light, dark
  const inputRef = useRef(null);

  // Theme Logic
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let isDark = theme === "dark";
      if (theme === "system") isDark = mediaQuery.matches;

      if (isDark) root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
    };

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  // Scroll Logic
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "light") return "bi-sun-fill";
    if (theme === "dark") return "bi-moon-fill";
    return "bi-circle-half";
  };

  return (
    <div className="px-3 px-lg-4 py-3">
      <nav
        className={`navbar navbar-expand-lg rounded-4 px-3 px-lg-5 transition-all duration-300 ${scrolled ? "glass-panel py-3" : "py-4"
          }`}
        style={{ transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="container-fluid d-flex align-items-center">
          {/* Logo - Minimal & Geometric */}
          <a className="navbar-brand fw-bolder fs-4 d-flex align-items-center gap-2 me-4" href="#">
            <div className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: "32px", height: "32px", background: "var(--text-main)", color: "var(--bg-body)" }}>
              <span className="fw-bold" style={{ fontSize: "16px", letterSpacing: "-0.05em" }}>K</span>
            </div>
            <span style={{ letterSpacing: "-0.05em", color: "var(--text-main)" }}>KaamSetu</span>
          </a>

          {/* Desktop Search Bar (Hidden on Mobile) */}
          <div
            className="d-none d-lg-flex align-items-center position-relative transition-all me-auto"
            style={{
              width: searchActive ? "340px" : "240px",
              transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <div
              className="d-flex align-items-center rounded-pill"
              style={{
                position: "absolute",
                width: "100%",
                height: "44px",
                overflow: "hidden",
                cursor: "text",
                backgroundColor: searchActive ? "var(--bg-card)" : "var(--bg-surface)",
                border: searchActive ? "1px solid var(--border-active)" : "1px solid var(--border-color)",
                boxShadow: searchActive ? "var(--shadow-lg)" : "none",
                transition: "all 0.2s ease"
              }}
              onClick={() => {
                setSearchActive(true);
                inputRef.current?.focus();
              }}
            >
              <i
                className={`bi bi-search fs-6`}
                style={{
                  marginLeft: "16px",
                  transition: "color 0.2s",
                  color: searchActive ? "var(--text-main)" : "var(--text-muted)"
                }}
              ></i>

              <input
                ref={inputRef}
                type="text"
                className="form-control border-0 bg-transparent shadow-none"
                placeholder="Search jobs..."
                style={{
                  opacity: 1,
                  transform: "translateX(0)",
                  fontSize: "0.9rem",
                  paddingLeft: "12px",
                  fontWeight: "500",
                  color: "var(--text-main)"
                }}
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
            </div>
          </div>

          {/* Mobile Search Toggle */}
          <button
            className="btn d-lg-none ms-auto me-2 rounded-circle p-0 flex-shrink-0 d-flex align-items-center justify-content-center"
            onClick={() => setSearchActive(!searchActive)}
            style={{
              width: "40px",
              height: "40px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              color: "var(--text-main)"
            }}
          >
            {searchActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            )}
          </button>

          <button
            className="btn d-lg-none border-0 shadow-none p-0 flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navContent"
            style={{
              width: "40px",
              height: "40px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              color: "var(--text-main)"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="collapse navbar-collapse flex-grow-0" id="navContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-2 gap-lg-4 align-items-center">
              <li className="nav-item">
                <a className="nav-link fw-medium px-2 hover-dark" href="#" style={{ color: "var(--text-muted)" }}>Find Jobs</a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium px-2 hover-dark" href="#" style={{ color: "var(--text-muted)" }}>Companies</a>
              </li>

              {/* Theme Toggle */}
              <li className="nav-item">
                <button
                  onClick={toggleTheme}
                  className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-surface)",
                    color: "var(--text-main)"
                  }}
                  title={`Current theme: ${theme}`}
                >
                  {theme === "light" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  )}
                  {theme === "dark" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                  {theme === "system" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  )}
                </button>
              </li>

              <li className="nav-item">
                <button className="btn rounded-pill px-4 py-2 fw-semibold shadow-sm"
                  style={{
                    background: "var(--text-main)",
                    color: "var(--bg-body)",
                    fontSize: "0.95rem",
                    border: "none"
                  }}>
                  Sign In
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Search Overlay - Animated */}
        <div className={`d-lg-none w-100 px-3 mobile-search-overlay ${searchActive ? "active" : ""}`}>
          <div className="d-flex align-items-center rounded-pill px-3 py-2 mt-3"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-active)",
              boxShadow: "var(--shadow-md)"
            }}>
            <i className="bi bi-search text-muted"></i>
            <input
              ref={(el) => searchActive && el?.focus()}
              type="text"
              className="form-control border-0 bg-transparent shadow-none"
              placeholder="Search jobs..."
              style={{ color: "var(--text-main)", fontWeight: "500" }}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
