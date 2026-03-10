"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Virtuoso } from "react-virtuoso";
import { useInfiniteJobs } from "@/hooks/queries/useInfiniteJobs";
import { Card } from "@/components/common/FormComponents"; // We shouldn't use this, Card is from components/common/Card
import SearchHero from "@/components/common/SearchHero";
import PageTransitions from "@/components/common/PageTransitions";

// Fix import for the Job Card, not the FormComponent wrapper Card
import JobCard from "@/components/common/Card";

const Listing = dynamic(() => import("@/components/common/Listing"), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Don't SSR the modal list
});

function HomePageContent() {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isSwitch, setIsSwitch] = useState(false);

  // In Next router, searchParams is read-only.
  // We would need useRouter to programmatically change them, 
  // but we'll use window.history.pushState or Next Link depending on use map.
  const searchParams = useSearchParams();

  const openJobId = searchParams.get("openJob");
  const searchQuery = searchParams.get('search') || '';
  const locationQuery = searchParams.get('location') || '';
  const categoryQuery = searchParams.get('category') || '';

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteJobs({
    search: searchQuery,
    location: locationQuery,
    category: categoryQuery
  });

  const allJobs = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.jobs) || [];
  }, [data]);

  useEffect(() => {
    if (openJobId && allJobs.length > 0) {
      const job = allJobs.find((j: any) => j._id === openJobId);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [openJobId, allJobs]);

  const handleJobClick = (job: any) => {
    if (selectedJob !== null && selectedJob._id !== job._id) {
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

  const handleHeroSearch = ({ search, location, category }: { search?: string, location?: string, category?: string }) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (category && category !== 'All') params.set('category', category);

    // Use NextJS window history state to update without a full reload or we can use next/router.
    window.history.pushState(null, '', `/?${params.toString()}`);

    // The component won't re-render automatically just from pushState with Next.js App Router 
    // if we are solely relying on useSearchParams. 
    // We'll need a better strategy if we want client-side soft navigation down the road, 
    // but for now this matches the structure.
  };

  if (isError) return (
    <div className="text-center py-5 mt-5">
      <i className="bi bi-exclamation-circle text-danger fs-1"></i>
      <h5 className="mt-3">Failed to load jobs</h5>
      <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <PageTransitions>
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
              {isLoading ? (
                <div className="py-5 text-center">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Finding the best jobs for you...</p>
                </div>
              ) : allJobs.length === 0 ? (
                <div className="py-5 text-center">
                  <i className="bi bi-search text-muted fs-1"></i>
                  <p className="mt-3 text-muted">No jobs found matching your criteria.</p>
                </div>
              ) : (
                <Virtuoso
                  useWindowScroll
                  data={allJobs}
                  endReached={() => hasNextPage && fetchNextPage()}
                  overscan={1500}
                  increaseViewportBy={1000}
                  atBottomThreshold={300}
                  itemContent={(index, job) => (
                    <div className="pb-3 px-1">
                      <JobCard
                        job={job}
                        isSelected={selectedJob?._id === job._id}
                        onClick={() => handleJobClick(job)}
                      />
                    </div>
                  )}
                  components={{
                    Footer: () => {
                      if (isFetchingNextPage) return <div className="py-4 text-center text-muted"><div className="spinner-border spinner-border-sm me-2"></div>Loading more...</div>;
                      if (!hasNextPage && allJobs.length > 0) return <div className="py-5 text-center text-muted small border-top mt-4">You've reached the end of the list</div>;
                      return null;
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className={`${detailColumnClass} layout-transition`}
            style={{ position: 'sticky', height: "calc(100vh - 120px)", overflowY: "hidden", top: "110px", borderRadius: "24px", zIndex: 1100 }}>
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
    </PageTransitions>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="py-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>}>
      <HomePageContent />
    </Suspense>
  );
}
