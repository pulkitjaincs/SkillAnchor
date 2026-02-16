
import { InputField, SelectField } from '../common/FormComponents';

function EditProfile_Finish({ formData, handleChange, setValues }) {
    return (
        <div>
            <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Almost done!</h4>

            <p className="fw-semibold mb-1" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Expected Salary</p>
            <div className="row g-2 mb-4">
                <div className="col-4">
                    <InputField name="expectedSalaryMin" value={formData.expectedSalaryMin} onChange={handleChange} type="number" placeholder="Min ₹" />
                </div>
                <div className="col-4">
                    <InputField name="expectedSalaryMax" value={formData.expectedSalaryMax} onChange={handleChange} type="number" placeholder="Max ₹ (optional)" />
                </div>
                <div className="col-4">
                    <SelectField
                        name="expectedSalaryType"
                        value={formData.expectedSalaryType}
                        onChange={handleChange}
                        options={[
                            { label: '/ Month', value: 'monthly' },
                            { label: '/ Day', value: 'daily' }
                        ]}
                    />
                </div>
            </div>

            <p className="fw-semibold mb-1" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Identity Documents <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </p>
            <div className="row g-2">
                <div className="col-md-6">
                    <InputField
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setValues({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                        maxLength={12}
                        placeholder="Aadhaar (12 digits)"
                    />
                </div>
                <div className="col-md-6">
                    <InputField
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                        placeholder="PAN Number"
                    />
                </div>
                <div className="col-md-6">
                    <InputField
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        style={{ textTransform: 'uppercase' }}
                        placeholder="Driving License"
                    />
                </div>
            </div>
        </div>
    );
}

export default EditProfile_Finish;
