"use client";

import React, { useState, useEffect, useRef } from 'react';
import './SearchHero.css';
import { JOB_CATEGORIES } from '../../constants/jobConstants';

interface SearchHeroProps {
    onSearch: (params: { search: string; location: string; category: string }) => void;
    initialSearchQuery?: string;
    initialLocation?: string;
    initialCategory?: string;
}

const SearchHero = ({
    onSearch,
    initialSearchQuery = '',
    initialLocation = '',
    initialCategory = 'All'
}: SearchHeroProps) => {
    const [search, setSearch] = useState(initialSearchQuery);
    const [location, setLocation] = useState(initialLocation);
    const [activeCategory, setActiveCategory] = useState(initialCategory || 'All');
    const heroRef = useRef<HTMLDivElement>(null);

    const categories = [{ name: 'All', icon: 'bi-grid-fill' }, ...JOB_CATEGORIES];

    useEffect(() => { setSearch(initialSearchQuery); }, [initialSearchQuery]);
    useEffect(() => { setLocation(initialLocation); }, [initialLocation]);
    useEffect(() => { setActiveCategory(initialCategory || 'All'); }, [initialCategory]);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                window.dispatchEvent(new CustomEvent('hero-visibility', {
                    detail: { visible: entry.isIntersecting }
                }));
            },
            { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ search, location, category: activeCategory === 'All' ? '' : activeCategory });
    };

    const handleCategoryClick = (cat: string) => {
        setActiveCategory(cat);
        onSearch({ search, location, category: cat === 'All' ? '' : cat });
    };

    return (
        <div className="search-hero-container mb-5 mt-3" ref={heroRef}>
            <div className="search-hero-content text-center mb-4">
                <h1 className="hero-title display-4 fw-bolder mb-2">
                    Find Your Next <span className="text-primary-gradient">Opportunity</span>
                </h1>
                <p className="hero-subtitle text-muted fs-5">
                    Connecting skilled workers with local businesses in real-time.
                </p>
            </div>

            <div className="search-bar-wrapper glass-panel shadow-lg rounded-pill p-2 d-flex align-items-center mx-auto">
                <form onSubmit={handleSearchSubmit} className="d-flex w-100 align-items-center">
                    <div className="search-input-group d-flex align-items-center flex-grow-1 px-3">
                        <i className="bi bi-search text-muted fs-5 me-2"></i>
                        <input
                            type="text"
                            className="form-control border-0 bg-transparent shadow-none"
                            placeholder="Search job titles or skills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="divider d-none d-md-block"></div>

                    <div className="search-input-group d-flex align-items-center flex-grow-1 px-3 d-none d-md-flex">
                        <i className="bi bi-geo-alt-fill text-primary-500 fs-5 me-2"></i>
                        <input
                            type="text"
                            className="form-control border-0 bg-transparent shadow-none"
                            placeholder="City or state..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={{ color: 'var(--text-main)' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary-gradient rounded-pill px-4 py-2 fw-bold shadow-sm h-100 ms-2 text-white">
                        Search
                    </button>
                </form>
            </div>

            <div className="mt-6 flex justify-center flex-wrap gap-2.5 px-4">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.name;
                    return (
                        <button
                            key={cat.name}
                            onClick={() => handleCategoryClick(cat.name)}
                            className={`flex items-center gap-2 !rounded-full px-4 py-2 font-medium text-sm transition-all duration-200 border category-chip ${
                                isActive 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 active' 
                                    : 'bg-white/50 dark:bg-black/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-black/50'
                            }`}
                        >
                            <i className={`bi ${cat.icon}`}></i>
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchHero;
