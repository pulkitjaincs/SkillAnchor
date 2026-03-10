import SettingsClient from './SettingsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings | SkillAnchor',
    description: 'Manage your SkillAnchor account settings.',
};

export default function SettingsPage() {
    return (
        <SettingsClient />
    );
}
