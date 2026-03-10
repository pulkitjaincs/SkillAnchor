export const JOB_CATEGORIES = [
    { name: 'Food & Hospitality', icon: 'bi-cup-hot-fill' },
    { name: 'Cleaning', icon: 'bi-stars' },
    { name: 'Logistics', icon: 'bi-truck' },
    { name: 'Construction', icon: 'bi-building-fill' },
    { name: 'Healthcare', icon: 'bi-heart-pulse-fill' },
    { name: 'Retail', icon: 'bi-shop' },
    { name: 'Events', icon: 'bi-calendar-event' },
    { name: 'Manufacturing', icon: 'bi-gear-fill' },
    { name: 'Maintenance', icon: 'bi-tools' },
    { name: 'Security', icon: 'bi-shield-lock-fill' }
];

export const CATEGORY_OPTIONS = JOB_CATEGORIES.map(cat => ({
    label: cat.name,
    value: cat.name
}));
