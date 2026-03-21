import { useState, useCallback } from 'react';

/**
 * Custom hook for debouncing values (useful for search inputs)
 */
export const useDebounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(callback: T, delay: number) => {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback((...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);

        const id = setTimeout(() => {
            callback(...args);
        }, delay);

        setTimeoutId(id);
    }, [callback, delay, timeoutId]);

    return debouncedCallback;
};

/**
 * Custom hook for handling form state
 */
export const useForm = <T extends Record<string, unknown>>(initialValues: T) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const setValue = (name: keyof T, value: T[keyof T]) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
    };

    return {
        values,
        errors,
        loading,
        handleChange,
        setValue,
        setValues,
        setErrors,
        setLoading,
        reset
    };
};
