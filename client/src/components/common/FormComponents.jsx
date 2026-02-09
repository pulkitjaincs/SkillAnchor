export const InputField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    className = '',
    helpText,
    icon,
    sm = false,
    maxLength,
    style = {}
}) => (
    <div className={`mb-3 ${className}`}>
        {label && (
            <label htmlFor={name} className="form-label fw-medium" style={{ color: 'var(--text-main)', fontSize: sm ? '0.85rem' : undefined }}>
                {label} {required && <span className="text-danger">*</span>}
                {helpText && <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.8rem' }}>({helpText})</span>}
            </label>
        )}
        <div className={type === 'date' ? 'premium-date-input' : ''} style={{ position: 'relative' }}>
            {icon && (
                <i className={`bi ${icon}`} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontSize: '1rem'
                }} />
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                maxLength={maxLength}
                className={`form-control ${sm ? 'form-control-sm' : ''}`}
                style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    border: error ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                    borderRadius: sm ? '10px' : '12px',
                    padding: sm ? '10px 14px' : '12px 16px',
                    paddingLeft: icon ? '40px' : undefined,
                    ...style
                }}
            />
        </div>
        {error && <small className="text-danger">{error}</small>}
    </div>
);

/**
 * Reusable select field component
 */
export const SelectField = ({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    required = false,
    disabled = false,
    error,
    className = ''
}) => (
    <div className={`mb-3 ${className}`}>
        {label && (
            <label htmlFor={name} className="form-label fw-medium" style={{ color: 'var(--text-main)' }}>
                {label} {required && <span className="text-danger">*</span>}
            </label>
        )}
        <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="form-select"
            style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: error ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px'
            }}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                    {opt.label || opt}
                </option>
            ))}
        </select>
        {error && <small className="text-danger">{error}</small>}
    </div>
);

/**
 * Reusable textarea component
 */
export const TextAreaField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 4,
    required = false,
    disabled = false,
    error,
    className = '',
    sm = false
}) => (
    <div className={`mb-3 ${className}`}>
        {label && (
            <label htmlFor={name} className="form-label fw-medium" style={{ color: 'var(--text-main)', fontSize: sm ? '0.85rem' : undefined }}>
                {label} {required && <span className="text-danger">*</span>}
            </label>
        )}
        <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            disabled={disabled}
            className={`form-control ${sm ? 'form-control-sm' : ''}`}
            style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: error ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                borderRadius: sm ? '10px' : '12px',
                padding: sm ? '10px 14px' : '12px 16px',
                resize: 'vertical'
            }}
        />
        {error && <small className="text-danger">{error}</small>}
    </div>
);


export const Button = ({
    children,
    variant = 'primary',
    type = 'button',
    onClick,
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    style = {}
}) => {
    const variants = {
        primary: { background: 'var(--primary-500)', color: 'white' },
        secondary: { background: 'var(--bg-surface)', color: 'var(--text-main)' },
        success: { background: '#22c55e', color: 'white' },
        danger: { background: '#ef4444', color: 'white' },
        outline: { background: 'transparent', border: '2px solid var(--primary-500)', color: 'var(--primary-500)' }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`btn ${fullWidth ? 'w-100' : ''} ${className}`}
            style={{
                ...variants[variant],
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: 600,
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                ...style
            }}
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : null}
            {children}
        </button>
    );
};


export const Card = ({ children, className = '', style = {} }) => (
    <div
        className={className}
        style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            ...style
        }}
    >
        {children}
    </div>
);
