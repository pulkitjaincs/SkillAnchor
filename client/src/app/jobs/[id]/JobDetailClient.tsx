"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Search, Banknote, Briefcase, Users, SunMedium, Code, Gift, Check, ShieldCheck, Rocket, Lock, CheckCircle2, Link as LinkIcon, Info } from 'lucide-react';
import { useJobDetails, useApplications, useApplyForJob } from '@/hooks/queries/useApplications';
import { formatDate, formatSalary, timeAgo } from '@/utils/index';

const ApplyModal = dynamic(() => import('@/components/common/ApplyModal'), { ssr: false });

export default function JobDetailClient({ id }: { id: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { data: job, isLoading: loading, isError } = useJobDetails(id);
    const { data: applications } = useApplications(!!user && user.role === 'worker');
    const applyMutation = useApplyForJob();

    const applied = useMemo(() => {
        if (!user || user.role !== 'worker' || !applications) return false;
        const allApps = applications.pages?.flatMap((p: any) => p.applications) || [];
        return allApps.some((app: any) => app.job?._id === id);
    }, [applications, user, id]);

    const handleApply = async (coverNote: string) => {
        if (!user) {
            router.push(`/login?redirect=/jobs/${id}`);
            return;
        }
        try {
            await applyMutation.mutateAsync({ jobId: id, data: { coverNote } });
            setShowApplyModal(false);
        } catch (err: any) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Error applying for job');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="rounded-3xl mb-8 overflow-hidden h-[340px] bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="rounded-2xl h-8 w-3/5 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                            <div className="rounded-2xl h-4 w-2/5 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                            <div className="rounded-3xl h-40 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="rounded-3xl h-[340px] bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error ───────────────────────────────────────────────────────────────────
    if (isError || !job) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 dark:bg-slate-950">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-6 py-12 backdrop-blur-3xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-3xl shadow-2xl max-w-md"
                >
                    <div className="mb-6 mx-auto rounded-full flex items-center justify-center w-24 h-24 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                        <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white mb-2">Job Not Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">It may have been removed or the link is broken.</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href="/" className="inline-flex items-center justify-center px-8 py-3 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    const isActive = job.status === 'active';
    const canApply = user?.role !== 'employer';

    // ─── Main render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 pb-20">

            {/* ═══ CLEAN HERO BANNER ══════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden w-full h-[200px] sm:h-[220px] bg-indigo-50 dark:bg-[#13151c]">
                {/* Subtle gradient orbs */}
                <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[150%] bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                {/* Noise dither layer to eliminate banding */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.06] pointer-events-none mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                    <filter id="heroNoise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
                    <rect width="100%" height="100%" filter="url(#heroNoise)"/>
                </svg>

                {/* Back nav container */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 font-semibold text-sm !rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-300 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>

            {/* ═══ IDENTITY ROW ═════════════════════════════════════════════════════ */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-8 sm:-mt-12 mb-8 p-6 sm:p-8 rounded-2xl backdrop-blur-2xl bg-white/70 dark:bg-[#1a1c23]/80 border border-slate-200/50 dark:border-transparent shadow-xl"
                >
                    <div className="shrink-0 relative rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#1a1c23] w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-800">
                        {job.company?.logo && !imageError ? (
                            <Image 
                                src={job.company.logo} 
                                alt={job.company.name} 
                                fill 
                                sizes="112px" 
                                className="object-cover" 
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-extrabold text-white text-3xl bg-gradient-to-br from-indigo-500 to-purple-600">
                                {job.title?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Title Block */}
                    <div className="flex-grow w-full">
                        <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
                            {job.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 sm:gap-x-4 text-sm sm:text-base">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{job.company?.name}</span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                            <span className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                                <MapPin className="w-4 h-4 mr-1.5" /> {job.city}, {job.state}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                            <span className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                                <Clock className="w-4 h-4 mr-1.5" /> {timeAgo(job.createdAt)}
                            </span>
                            
                            <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-500/20 ml-auto sm:ml-2">
                                {job.jobType?.replace(/-/g, ' ') || 'Full-time'}
                            </span>
                            
                            {!isActive && (
                                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest border border-amber-500/20">
                                    {job.status}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ═══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ── LEFT COL ──────────────────────────────────────────────────── */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Quick Stats Glass Panel */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                            className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_0.8fr] lg:grid-cols-[1.8fr_1fr_0.8fr] gap-3 p-3 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-black/20 border border-slate-200/50 dark:border-transparent shadow-md"
                        >
                            {[
                                { icon: Banknote, label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax, job.salaryType) },
                                { icon: Briefcase, label: 'Experience', value: job.experienceMin > 0 ? `${job.experienceMin}+ yrs` : 'Fresher' },
                                { icon: SunMedium, label: 'Shift', value: job.shift ? job.shift.charAt(0).toUpperCase() + job.shift.slice(1).toLowerCase() : 'Flexible' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between px-4 sm:px-5 py-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-slate-200/50 dark:border-transparent shadow-sm overflow-hidden">
                                    <div className="flex flex-col pr-2 sm:pr-3">
                                        <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{stat.label}</div>
                                        <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">{stat.value}</div>
                                    </div>
                                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Description Section */}
                        <motion.section 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                            className="p-8 sm:p-10 rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-[#1a1c23]/60 border border-slate-200/50 dark:border-transparent shadow-md"
                        >
                            <h3 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white mb-2">About the role</h3>
                            <div className="w-12 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6"></div>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                                {job.description}
                            </div>
                        </motion.section>

                        {/* Skills & Benefits Grid */}
                        {(job.skills?.length > 0 || job.benefits?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Skills Cell */}
                                {job.skills?.length > 0 && (
                                    <motion.div 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                                        className="p-8 rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-[#1a1c23]/60 border border-slate-200/50 dark:border-transparent shadow-md h-full"
                                    >
                                        <h5 className="flex items-center font-extrabold text-xl tracking-tight text-slate-900 dark:text-white mb-2">
                                            <Code className="w-6 h-6 mr-3 text-indigo-500" /> Skills Required
                                        </h5>
                                        <div className="w-10 h-1.5 bg-indigo-500 rounded-full mb-6"></div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {job.skills.map((skill: string, idx: number) => (
                                                <span key={idx} className="px-4 py-2 rounded-xl font-semibold text-sm bg-white/80 dark:bg-black/40 border border-indigo-500/20 text-indigo-900 dark:text-indigo-300 shadow-sm backdrop-blur-md">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Perks Cell */}
                                {job.benefits?.length > 0 && (
                                    <motion.div 
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                                        className="p-8 rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-[#1a1c23]/60 border border-slate-200/50 dark:border-transparent shadow-md h-full"
                                    >
                                        <h5 className="flex items-center font-extrabold text-xl tracking-tight text-slate-900 dark:text-white mb-2">
                                            <Gift className="w-6 h-6 mr-3 text-emerald-500" /> Perks & Benefits
                                        </h5>
                                        <div className="w-10 h-1.5 bg-emerald-500 rounded-full mb-6"></div>
                                        <div className="flex flex-col gap-3">
                                            {job.benefits.map((b: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                                                        <Check className="w-4 h-4" strokeWidth={3} />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{b}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT COL (STICKY SIDEBAR) ────────────────────────────────── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-6">

                            {/* Main Action Card */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                                className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/70 dark:bg-[#1a1c23]/70 border border-slate-200/50 dark:border-transparent shadow-xl"
                            >
                                {/* Status Header Plate */}
                                <div className={`px-8 py-6 relative overflow-hidden ${
                                    applied ? 'bg-gradient-to-br from-emerald-800 to-emerald-950' : 
                                    isActive ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800' : 
                                    'bg-gradient-to-br from-slate-700 to-slate-900'
                                }`}>
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
                                            {applied ? <CheckCircle2 className="w-6 h-6 text-white" /> : 
                                             isActive ? <Rocket className="w-6 h-6 text-white" /> : 
                                             <Lock className="w-6 h-6 text-white" />}
                                        </div>
                                        <div>
                                            <div className="font-black text-white text-lg tracking-tight">
                                                {applied ? 'You applied!' : isActive ? 'Ready to apply?' : 'Applications closed'}
                                            </div>
                                            <div className="text-white/80 font-medium text-sm">
                                                {applied ? 'Your application is under review' : isActive ? 'Typically responds in 1-2 days' : `Status: ${job.status}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-8">
                                    {canApply && (
                                        <motion.button
                                            whileHover={!applied && isActive ? { scale: 1.02 } : {}}
                                            whileTap={!applied && isActive ? { scale: 0.98 } : {}}
                                            onClick={() => user ? setShowApplyModal(true) : router.push(`/login?redirect=/jobs/${id}`)}
                                            disabled={applied || !isActive}
                                            className={`w-full py-4 !rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-xl ${
                                                applied ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 
                                                !isActive ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 
                                                'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:shadow-indigo-500/20'
                                            } transition-all duration-300`}
                                        >
                                            {applied ? (
                                                <><CheckCircle2 className="w-5 h-5" /> Already Applied</>
                                            ) : !isActive ? (
                                                <><Lock className="w-5 h-5" /> Closed</>
                                            ) : (
                                                <>Apply Now &nbsp;→</>
                                            )}
                                        </motion.button>
                                    )}

                                    {user?.role === 'employer' && (
                                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 text-sm font-medium mb-4">
                                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="m-0">Switch to a worker account to apply.</p>
                                        </div>
                                    )}

                                    {canApply && <div className="h-6"></div>}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleShare}
                                        className="w-full py-3.5 !rounded-2xl font-bold flex items-center justify-center gap-2 bg-white/50 dark:bg-black/30 border border-slate-200 dark:border-transparent text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-black/50 transition-colors"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <LinkIcon className="w-5 h-5" />}
                                        {copied ? 'Link copied!' : 'Share this job'}
                                    </motion.button>

                                    {/* Stats row */}
                                    <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-white/10">
                                        <div className="flex justify-between items-center text-center">
                                            <div className="flex-1">
                                                <div className="font-extrabold text-2xl text-slate-900 dark:text-white mb-1">{job.applicationsCount ?? '—'}</div>
                                                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Applicants</div>
                                            </div>
                                            <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/10"></div>
                                            <div className="flex-1">
                                                <div className="font-extrabold text-2xl text-slate-900 dark:text-white mb-1">{job.vacancies || 1}</div>
                                                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Vacancies</div>
                                            </div>
                                       
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Trust Badge */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-transparent backdrop-blur-md"
                            >
                                <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Verified Employer</div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Listing reviewed by SkillAnchor</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Apply Modal */}
            <AnimatePresence>
                {showApplyModal && (
                    <ApplyModal
                        show={showApplyModal}
                        onClose={() => setShowApplyModal(false)}
                        onApply={handleApply}
                        applying={applyMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
