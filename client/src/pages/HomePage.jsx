import { useState, useEffect } from "react";
import Card from "../components/common/Card";
import Listing from "../components/common/Listing";
import SearchHero from "../components/common/SearchHero";
import { useSearchParams } from "react-router-dom";
import { jobsAPI } from "../services/api";

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
    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        setJobs([]);
        setCursor(null);
        setHasMore(true);
        setLoading(false);
        loadJobsForSearch();
    }, [searchQuery, locationQuery, categoryQuery]);

    const handleHeroSearch = ({ search, location, category }) => {
        const params = {};
        if (search) params.search = search;
        if (location) params.location = location;
        if (category && category !== 'All') params.category = category;
        setSearchParams(params);
    };

    const loadJobsForSearch = async () => {
        try {
            const params = { limit: 10 };
            if (searchQuery) params.search = searchQuery;
            if (locationQuery) params.location = locationQuery;
            if (categoryQuery) params.category = categoryQuery;

            const { data } = await jobsAPI.getAll(params);
            if (data.jobs && Array.isArray(data.jobs)) {
                setJobs(data.jobs);
                setCursor(data.jobs[data.jobs.length - 1]?._id);
                setHasMore(data.hasMore);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const loadJobs = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const params = { limit: 12, cursor };
            if (searchQuery) params.search = searchQuery;
            if (locationQuery) params.location = locationQuery;
            if (categoryQuery) params.category = categoryQuery;

            const { data } = await jobsAPI.getAll(params);

            if (data.jobs && Array.isArray(data.jobs)) {
                setJobs(prev => [...prev, ...data.jobs]);
                setCursor(data.jobs[data.jobs.length - 1]?._id);
                setHasMore(data.hasMore);
            } else {
                console.error("Invalid data format", data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="d-flex align-items-center justify-content-between mb-4"
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
                        <span className="badge border shadow-sm rounded-pill px-3 py-2 fw-medium"
                            style={{ background: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
                            {jobs.length} found
                        </span>
                    </div>

                    <div className="pe-3 pb-5">
                        {jobs.map((job, index) => (
                            <Card
                                key={`${job._id}-${index}`}
                                job={job}
                                isSelected={selectedJob?._id === job._id}
                                onClick={(e) => handleJobClick(job, e)}
                            />
                        ))}
                    </div>
                </div>

                <div className={`${detailColumnClass} layout-transition`}
                    style={{ position: 'sticky', height: "calc(100vh - 106px)", overflowY: "hidden", top: "96px", borderRadius: "24px", zIndex: 1100 }}>
                    {selectedJob && (
                        <Listing
                            job={selectedJob}
                            onClose={() => { setSelectedJob(null); setIsSwitch(false); }}
                            isSwitch={isSwitch}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;