import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Card from "./components/common/Card";
import Footer from "./components/layout/Footer";
import Listing from "./components/common/Listing";


const JOBS = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  title: i % 2 === 0 ? "Chef at Radisson Blu" : "Hotel Manager",
  company: i % 2 === 0 ? "Radisson Hotels" : "Marriott",
  location: "New Delhi, India",
  salary: "25,000 - 35,000",
  description: "A wonderful opportunity for a professional to join our luxury hotel chain. We are looking for dedicated individuals...",
  longDescription: `
    This is a full-time role for a dedicated professional.
    
    Responsibilities:
    - Manage daily operations
    - Ensure high quality service
    - Coordinate with other staff members
    
    Requirements:
    - 2+ years of experience
    - Good communication skills
    - Team player
  `,
  image: `https://source.unsplash.com/random/400x300?hotel,chef&sig=${i}`, // Using random images for demo
  tags: ["Full Time", "Urgent", "Food & Beverage"]
}));

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSwitch, setIsSwitch] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const url = cursor
        ? `/api/jobs?limit=10&cursor=${cursor}`
        : `/api/jobs?limit=10`;
      const res = await fetch(url);
      const data = await res.json();

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
    <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "var(--bg-body)", transition: "background-color 0.3s" }}>
      <Navbar name="KaamSetu" />

      <div className="container-fluid flex-grow-1 px-4 px-lg-5" style={{ maxWidth: "1600px" }}>
        <div className="row g-4">

          <div className={`${listColumnClass} d-flex flex-column layout-transition`}
            style={{ paddingTop: "20px", paddingBottom: "20px" }}>
            <div className="d-flex align-items-center justify-content-between mb-4 px-2">
              <h4 className="fw-bolder mb-0 tracking-tight" style={{ color: "var(--text-main)" }}>Recent Jobs</h4>
              <span className="badge border shadow-sm rounded-pill px-3 py-2 fw-medium"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
                {jobs.length} found
              </span>
            </div>

            <div className="pe-3 pb-5">
              {jobs.map((job) => (
                <Card
                  key={job._id}
                  job={job}
                  isSelected={selectedJob?._id === job._id}
                  onClick={(e) => handleJobClick(job, e)}
                />
              ))}
            </div>
          </div>

          <div className={`${detailColumnClass} layout-transition sticky-top`}
            style={{ height: "calc(100vh - 40px)", overflowY: "hidden", top: "20px", borderRadius: "24px", zIndex: 100 }}>
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
    </div>
  );
}

export default App;
