import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const Navbar = ({ name }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [theme, setTheme] = useState("light");
  const [heroVisible, setHeroVisible] = useState(true);
  const inputRef = useRef(null);
  const compactSearchRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Compact search bar state (synced with URL)
  const [compactSearch, setCompactSearch] = useState(searchParams.get('search') || '');
  const [compactLocation, setCompactLocation] = useState(searchParams.get('location') || '');

  const isHomePage = location.pathname === '/';

  // Show compact search when on HomePage and hero is scrolled out of view
  const showCompactSearch = isHomePage && !heroVisible;

  // Sync compact bar values when URL params change
  useEffect(() => {
    setCompactSearch(searchParams.get('search') || '');
    setCompactLocation(searchParams.get('location') || '');
  }, [searchParams]);

  // Listen for hero visibility custom event
  useEffect(() => {
    const handler = (e) => setHeroVisible(e.detail.visible);
    window.addEventListener('hero-visibility', handler);
    // Reset visibility when navigating away from home
    if (!isHomePage) setHeroVisible(true);
    return () => window.removeEventListener('hero-visibility', handler);
  }, [isHomePage]);

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

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate('/');
      }
      setSearchActive(false);
    }
  };

  const handleCompactSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const params = {};
      if (compactSearch.trim()) params.search = compactSearch.trim();
      if (compactLocation.trim()) params.location = compactLocation.trim();
      const currentCategory = searchParams.get('category');
      if (currentCategory) params.category = currentCategory;
      setSearchParams(params);
    }
  };

  const getThemeIcon = () => {
    if (theme === "light") return "bi-sun-fill";
    if (theme === "dark") return "bi-moon-fill";
    return "bi-circle-half";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="px-3 px-lg-4 py-3"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        background: scrolled ? 'var(--bg-body)' : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <nav
        className={`navbar navbar-expand-lg rounded-4 px-3 px-lg-5 transition-all duration-300 ${scrolled ? "glass-panel py-2" : "py-3"
          }`}
        style={{ transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="container-fluid d-flex align-items-center">
          <Link className="navbar-brand fw-bolder fs-4 d-flex align-items-center gap-2 me-4 logo-hover flex-shrink-0" to="/">
            <div className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: "32px", height: "32px", background: "var(--text-main)", color: "var(--bg-body)" }}>
              <span className="fw-bold" style={{ fontSize: "16px", letterSpacing: "-0.05em" }}>K</span>
            </div>
            <span style={{ letterSpacing: "-0.05em", color: "var(--text-main)" }}>KaamSetu</span>
          </Link>

          {/* --- COMPACT SEARCH BAR (appears when hero scrolls out on HomePage) --- */}
          {isHomePage && (
            <div
              className="d-none d-lg-flex align-items-center me-auto"
              style={{
                maxWidth: showCompactSearch ? '480px' : '0px',
                opacity: showCompactSearch ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-width 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), flex-basis 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: showCompactSearch ? 'all' : 'none',
                flex: showCompactSearch ? '1 1 480px' : '0 0 0px',
                willChange: 'max-width, opacity, flex-basis',
              }}
            >
              <div
                className="d-flex align-items-center rounded-pill w-100"
                style={{
                  height: '42px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                  overflow: 'hidden',
                  minWidth: '320px',
                }}
              >
                <div className="d-flex align-items-center flex-grow-1 px-3">
                  <i className="bi bi-search" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}></i>
                  <input
                    ref={compactSearchRef}
                    type="text"
                    value={compactSearch}
                    onChange={(e) => setCompactSearch(e.target.value)}
                    onKeyDown={handleCompactSearch}
                    className="form-control border-0 bg-transparent shadow-none py-0"
                    placeholder="Search jobs..."
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: 'var(--text-main)',
                      paddingLeft: '10px',
                    }}
                  />
                </div>

                <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', flexShrink: 0 }}></div>

                <div className="d-flex align-items-center px-3" style={{ minWidth: '120px' }}>
                  <i className="bi bi-geo-alt-fill" style={{ fontSize: '0.85rem', color: 'var(--primary-500)', flexShrink: 0 }}></i>
                  <input
                    type="text"
                    value={compactLocation}
                    onChange={(e) => setCompactLocation(e.target.value)}
                    onKeyDown={handleCompactSearch}
                    className="form-control border-0 bg-transparent shadow-none py-0"
                    placeholder="Location..."
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: 'var(--text-main)',
                      paddingLeft: '10px',
                    }}
                  />
                </div>

                <button
                  onClick={() => {
                    const params = {};
                    if (compactSearch.trim()) params.search = compactSearch.trim();
                    if (compactLocation.trim()) params.location = compactLocation.trim();
                    const currentCategory = searchParams.get('category');
                    if (currentCategory) params.category = currentCategory;
                    setSearchParams(params);
                  }}
                  className="btn rounded-pill px-3 py-1 fw-bold me-1 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                    color: 'white',
                    fontSize: '0.8rem',
                    border: 'none',
                    height: '32px',
                  }}
                >
                  <i className="bi bi-search me-1" style={{ fontSize: '0.75rem' }}></i>
                  Go
                </button>
              </div>
            </div>
          )}

          {/* --- ORIGINAL SEARCH (for non-homepage) --- */}
          {!isHomePage && (
            <div
              className="d-none d-lg-flex align-items-center position-relative transition-all me-auto"
              style={{
                width: searchActive ? "340px" : "240px",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
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
                  className="bi bi-search fs-6"
                  style={{
                    marginLeft: "16px",
                    transition: "color 0.2s",
                    color: searchActive ? "var(--text-main)" : "var(--text-muted)"
                  }}
                ></i>

                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
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
          )}

          {!isHomePage && (
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
          )}

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
              {user?.role === 'employer' && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link fw-medium px-2 hover-dark" to="/my-jobs" style={{ color: "var(--text-muted)" }}>My Jobs</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link fw-medium px-2 hover-dark" to="/my-team" style={{ color: "var(--text-muted)" }}>My Team</Link>
                  </li>
                </>
              )}

              {user?.role === 'worker' && (
                <li className="nav-item">
                  <Link className="nav-link fw-medium px-2 hover-dark" to="/my-applications" style={{ color: "var(--text-muted)" }}>My Applications</Link>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link fw-medium px-2 hover-dark" to="#" style={{ color: "var(--text-muted)" }}>Companies</Link>
              </li>

              <li className="nav-item">
                <button
                  onClick={toggleTheme}
                  className="btn rounded-circle d-flex align-items-center justify-content-center p-0 theme-toggle"
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
              {user ? (
                <li className="nav-item dropdown">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2 cursor-pointer" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: '44px', height: '44px',
                          background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                          color: 'white', fontSize: '1rem',
                          boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
                          border: '2px solid rgba(255,255,255,0.2)'
                        }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="fw-semibold d-none d-xl-inline" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {user.name}
                      </span>
                      <i className="bi bi-chevron-down" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', transition: 'transform 0.2s' }}></i>
                    </div>

                    <ul className="dropdown-menu dropdown-menu-end border-0"
                      style={{
                        borderRadius: '24px',
                        minWidth: '280px',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.18), 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                        border: '1px solid var(--border-color)',
                        marginTop: '14px',
                        zIndex: 1500,
                        animation: 'dropdownSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}>

                      {/* User Info Header */}
                      <li style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.04))',
                        borderRadius: '16px', padding: '16px', marginBottom: '8px'
                      }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{
                              width: '56px', height: '56px',
                              background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                              color: 'white', fontSize: '1.25rem',
                              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                            }}>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-grow-1 min-width-0">
                            <h6 className="mb-1 fw-bold text-truncate" style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{user.name}</h6>
                            <small className="text-truncate d-block" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {user.email || user.phone || 'Worker Account'}
                            </small>
                          </div>
                        </div>
                      </li>

                      {/* Menu Items */}
                      <li>
                        <Link className="dropdown-item rounded-3 d-flex align-items-center gap-3"
                          to="/profile"
                          style={{
                            color: 'var(--text-main)', transition: 'all 0.15s ease',
                            padding: '12px 14px', fontWeight: 500
                          }}>
                          <div className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '36px', height: '36px', borderRadius: '12px',
                              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))'
                            }}>
                            <i className="bi bi-person-fill" style={{ color: 'var(--primary-600)', fontSize: '1rem' }}></i>
                          </div>
                          <span>My Profile</span>
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item rounded-3 d-flex align-items-center gap-3"
                          to="/profile/settings"
                          style={{
                            color: 'var(--text-main)', transition: 'all 0.15s ease',
                            padding: '12px 14px', fontWeight: 500
                          }}>
                          <div className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '36px', height: '36px', borderRadius: '12px',
                              background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.12), rgba(107, 114, 128, 0.04))'
                            }}>
                            <i className="bi bi-gear-fill" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}></i>
                          </div>
                          <span>Account Settings</span>
                        </Link>
                      </li>

                      <li style={{ padding: '8px 0' }}>
                        <hr style={{ margin: 0, borderColor: 'var(--border-color)', opacity: 0.5 }} />
                      </li>

                      <li>
                        <button onClick={handleLogout}
                          className="dropdown-item rounded-3 d-flex align-items-center gap-3 w-100"
                          style={{
                            color: '#ef4444', transition: 'all 0.15s ease',
                            padding: '12px 14px', fontWeight: 500
                          }}>
                          <div className="d-flex align-items-center justify-content-center"
                            style={{
                              width: '36px', height: '36px', borderRadius: '12px',
                              background: 'rgba(239, 68, 68, 0.1)'
                            }}>
                            <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem' }}></i>
                          </div>
                          <span>Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </li>
              ) : (
                <li className="nav-item">
                  <Link to="/login" className="btn rounded-pill px-4 py-2 fw-semibold shadow-sm"
                    style={{
                      background: "var(--text-main)",
                      color: "var(--bg-body)",
                      fontSize: "0.95rem",
                      border: "none"
                    }}>
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

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
