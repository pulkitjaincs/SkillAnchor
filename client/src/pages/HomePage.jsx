import { useState, useEffect, lazy, Suspense } from "react";
import Card from "../components/common/Card";
import SearchHero from "../components/common/SearchHero";
import { useSearchParams } from "react-router-dom";
import { jobsAPI } from "../services/api";
import { Virtuoso } from "react-virtuoso";
const Listing = lazy(() => import("../components/common/Listing"));

function HomePage() {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isSwitch, setIsSwitch] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const openJobId = searchParams.get("openJob");
    const searchQuery = searchParams.get('search') || '';
    const locationQuery = searchParams.get('location') || '';
    const categoryQuery = searchParams.get('category') || '';

    useEffect(() => {
        if (openJobId && jobs.length > 0) {
            const job = jobs.find(j => j._id === openJobId);
            if (job) {
                setSelectedJob(job);
            }
        }
    }, [openJobId, jobs]);
    const fetchJobs = async (reset = false) => {
        if (loading) return;
        if (!reset && !hasMore) return;
        setLoading(true);

        try {
            const currentCursor = reset ? null : cursor;
            const params = { limit: 10, cursor: currentCursor };

            if (searchQuery) params.search = searchQuery;
            if (locationQuery) params.location = locationQuery;
            if (categoryQuery) params.category = categoryQuery;

            const { data } = await jobsAPI.getAll(params);

            if (data.jobs && Array.isArray(data.jobs)) {
                if (reset) {
                    setJobs(data.jobs);
                } else {
                    setJobs(prev => {
                        const existingIds = new Set(prev.map(j => j._id));
                        const newJobs = data.jobs.filter(j => !existingIds.has(j._id));
                        return [...prev, ...newJobs];
                    });
                }

                setCursor(data.jobs[data.jobs.length - 1]?._id);
                setHasMore(data.hasMore);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs(true);
    }, [searchQuery, locationQuery, categoryQuery]);


    const handleJobClick = (job, e) => {
        if (selectedJob !== null && selectedJob.id !== job.id) {
            setIsSwitch(true);
        } else {
            setIsSwitch(false);
        }
        setSelectedJob(job);
    };

    const listColumnClass = selectedJob
        ? "d-none d-lg-flex col-lg-4"
        : "col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3";

    const detailColumnClass = selectedJob
        ? "col-12 col-lg-8"
        : "d-none";

    const handleHeroSearch = ({ search, location, category }) => {
        const params = {};
        if (search) params.search = search;
        if (location) params.location = location;
        if (category && category !== 'All') params.category = category;
        setSearchParams(params);
    };

    return (
        <div className="container-fluid flex-grow-1 px-4 px-lg-5" style={{ maxWidth: "1600px" }}>

            <SearchHero
                onSearch={handleHeroSearch}
                initialSearchQuery={searchQuery}
                initialLocation={locationQuery}
                initialCategory={categoryQuery}
            />

            <div className="row g-4" style={{ paddingTop: '10px' }}>

                <div className={`${listColumnClass} d-flex flex-column layout-transition`}
                    style={{ paddingTop: "20px", paddingBottom: "20px" }}>
                    {!(searchQuery || locationQuery || categoryQuery) && (
                        <div className="d-flex align-items-center mb-4"
                            style={{
                                position: 'sticky',
                                top: '80px',
                                zIndex: 100,
                                background: 'var(--bg-body)',
                                paddingTop: '12px',
                                paddingBottom: '16px',
                                marginLeft: '-2rem',
                                marginRight: '-2rem',
                                paddingLeft: '2rem',
                                paddingRight: '2rem',
                            }}>
                            <h4 className="fw-bolder mb-0 tracking-tight" style={{ color: "var(--text-main)" }}>Recent Jobs</h4>
                        </div>
                    )}
                    <div className="pe-3 pb-5">
                        <Virtuoso
                            useWindowScroll
                            data={jobs}
                            endReached={() => fetchJobs(false)}
                            overscan={200}
                            itemContent={(index, job) => (
                                <Card
                                    job={job}
                                    isSelected={selectedJob?._id === job._id}
                                    onClick={(e) => handleJobClick(job, e)}
                                />
                            )}
                            components={{
                                Footer: () => {
                                    if (loading) return <div className="py-3 text-center text-muted">Loading more...</div>;
                                    if (!hasMore && jobs.length > 0) return <div className="py-3 text-center text-muted small">You've reached the end of the list</div>;
                                    return null;
                                }
                            }}
                        />
                    </div>
                </div>

                <div className={`${detailColumnClass} layout-transition`}
                    style={{ position: 'sticky', height: "calc(100vh - 106px)", overflowY: "hidden", top: "96px", borderRadius: "24px", zIndex: 1100 }}>
                    {selectedJob && (
                        <Suspense fallback={<div className="h-100 d-flex align-items-center justify-content-center text-muted">Loading Details...</div>}>
                            <Listing
                                job={selectedJob}
                                onClose={() => { setSelectedJob(null); setIsSwitch(false); }}
                                isSwitch={isSwitch}
                            />
                        </Suspense>

                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;