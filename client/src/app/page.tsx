"use client";

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteJobs } from "@/hooks/queries/useInfiniteJobs";
import SearchHero from "@/components/common/SearchHero";
import PageTransitions from "@/components/common/PageTransitions";
import JobCard from "@/components/common/Card";

const Listing = dynamic(() => import("@/components/common/Listing"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

function HomePageContent() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isSwitch, setIsSwitch] = useState(false);
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // IntersectionObserver-based infinite scroll
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (openJobId && allJobs.length > 0) {
      const job = allJobs.find((j: any) => j._id === openJobId);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [openJobId, allJobs]);

  const handleJobClick = useCallback((job: any) => {
    if (selectedJob !== null && selectedJob._id !== job._id) {
      setIsSwitch(true);
    } else {
      setIsSwitch(false);
    }
    setSelectedJob(job);
  }, [selectedJob]);

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
    router.push(`/?${params.toString()}`);
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
                <>
                  {allJobs.map((job: any) => (
                    <div key={job._id} className="pb-3 px-1">
                      <JobCard
                        job={job}
                        isSelected={selectedJob?._id === job._id}
                        onClick={() => handleJobClick(job)}
                      />
                    </div>
                  ))}

                  {/* Sentinel element — triggers fetchNextPage when scrolled into view */}
                  <div ref={loadMoreRef} style={{ height: '1px' }} />

                  {isFetchingNextPage && (
                    <div className="py-4 text-center text-muted">
                      <div className="spinner-border spinner-border-sm me-2"></div>Loading more...
                    </div>
                  )}
                  {!hasNextPage && allJobs.length > 0 && (
                    <div className="py-5 text-center text-muted small border-top mt-4">
                      You&apos;ve reached the end of the list
                    </div>
                  )}
                </>
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
