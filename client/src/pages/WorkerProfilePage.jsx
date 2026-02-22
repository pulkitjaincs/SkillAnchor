import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getInitials } from '../utils/index';
import { useProfile } from '../hooks/queries/useProfile';
import { useQueryClient } from '@tanstack/react-query';

import ProfileHeader from '../components/profile/ProfileHeader';
import SkillsSection from '../components/profile/SkillsSection';
import WorkHistorySection from '../components/profile/WorkHistorySection';
import EmployerQuickActions from '../components/profile/EmployerQuickActions';
import ProfileSidebar from '../components/profile/ProfileSidebar';

const WorkExperienceModal = lazy(() => import('../components/WorkExperienceModal'));

function WorkerProfilePage() {
    const { userId } = useParams();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const fromJobId = searchParams.get('fromJob');
    const fromTeam = searchParams.get('from') === 'team';
    const isOwnProfile = !userId;
    const navigate = useNavigate();
    const [selectedExp, setSelectedExp] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const { data: profile, isLoading: loading, isError } = useProfile(userId);

    const workHistory = useMemo(() => profile?.workHistory || [], [profile]);
    const isEmployer = profile?.role === 'employer';

    const completionPercent = useMemo(() => {
        if (!profile) return 0;
        if (profile.role === 'employer') {
            let score = 0;
            if (profile.name) score += 25;
            if (profile.phone) score += 25;
            if (profile.designation) score += 25;
            if (profile.company) score += 25;
            return Math.min(score, 100);
        }
        let score = 0;
        if (profile.name) score += 10;
        if (profile.gender) score += 10;
        if (profile.phone) score += 10;
        if (profile.city && profile.state) score += 10;
        if (profile.skills?.length > 0) score += 15;
        if (profile.languages?.length > 0) score += 10;
        if (profile.bio) score += 10;
        if (profile.expectedSalary?.min) score += 10;
        if (profile.dob) score += 5;
        if (profile.documents?.aadhaar?.number) score += 5;
        if (profile.documents?.pan?.number) score += 5;
        return Math.min(score, 100);
    }, [profile]);

    const getAge = useCallback((dob) => {
        if (!dob) return 0;
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }, []);

    const handleAddClick = useCallback(() => setShowAddModal(true), []);
    const handleExpClick = useCallback((exp) => setSelectedExp(exp), []);
    const handleModalClose = useCallback(() => { setShowAddModal(false); setSelectedExp(null); }, []);
    const handleSave = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: userId ? ['profile', userId] : ['profile'] });
    }, [queryClient, userId]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (isError || !profile) {
        if (isOwnProfile) navigate('/profile/edit');
        return null;
    }

    return (
        <div className="container py-4">
            {fromJobId && (
                <div className="mb-4">
                    <Link to={`/jobs/${fromJobId}/applicants`} className="text-decoration-none d-inline-flex align-items-center"
                        style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ← Back to Applicants
                    </Link>
                </div>
            )}
            {fromTeam && (
                <div className="mb-4">
                    <Link to="/my-team" className="text-decoration-none d-inline-flex align-items-center"
                        style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ← Back to My Team
                    </Link>
                </div>
            )}

            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isEmployer={isEmployer}
                completionPercent={completionPercent}
                getAge={getAge}
            />

            <div className="row g-4">
                <div className="col-lg-8">
                    {!isEmployer && <SkillsSection skills={profile.skills} isOwnProfile={isOwnProfile} />}
                    {isEmployer && <EmployerQuickActions />}
                    {!isEmployer && (
                        <WorkHistorySection
                            workHistory={workHistory}
                            isOwnProfile={isOwnProfile}
                            onAddClick={handleAddClick}
                            onExpClick={handleExpClick}
                        />
                    )}
                </div>

                <div className="col-lg-4">
                    <ProfileSidebar profile={profile} isEmployer={isEmployer} isOwnProfile={isOwnProfile} />
                </div>
            </div>

            <Suspense fallback={null}>
                <WorkExperienceModal
                    show={showAddModal || !!selectedExp}
                    onClose={handleModalClose}
                    experience={selectedExp}
                    onSave={handleSave}
                />
            </Suspense>
        </div>
    );
}

export default WorkerProfilePage;
