import { InputField, TextAreaField } from '@/components/common/FormComponents';

export default function EditProfile_Skills({ formData, handleChange }: any) {
    return (
        <div>
            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Tell us about your skills</h4>

            <TextAreaField label="Bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell employers about yourself..." />

            <InputField
                label="Skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Driving, Cooking, Electrician"
                helpText="Comma separated"
            />
            {formData.skills && (
                <div className="d-flex flex-wrap gap-2 mt-2 mb-4">
                    {formData.skills.split(',').filter((s: string) => s.trim()).map((s: string, i: number) => (
                        <span key={i} style={{
                            background: 'linear-gradient(135deg, var(--primary-500), #8b5cf6)',
                            color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500
                        }}>{s.trim()}</span>
                    ))}
                </div>
            )}

            <InputField
                label="Languages"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="e.g. Hindi, English"
                helpText="Comma separated"
            />
        </div>
    );
}
