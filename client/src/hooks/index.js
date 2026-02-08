import { useState, useCallback } from 'react';

/**
 * Custom hook for debouncing values (useful for search inputs)
 */
export const useDebounce = (callback, delay) => {
    const [timeoutId, setTimeoutId] = useState(null);

    const debouncedCallback = useCallback((...args) => {
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
export const useForm = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const setValue = (name, value) => {
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

/**
 * Custom hook for fetching data with loading and error states
 */
export const useFetch = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (apiCall) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute, setData };
};

/**
 * Custom hook for pagination
 */
export const usePagination = (initialLimit = 10) => {
    const [items, setItems] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async (fetchFn) => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await fetchFn(cursor, initialLimit);
            const newItems = response.data.jobs || response.data.items || [];

            setItems(prev => [...prev, ...newItems]);
            setCursor(newItems[newItems.length - 1]?._id);
            setHasMore(response.data.hasMore);
        } catch (err) {
            console.error('Pagination error:', err);
        } finally {
            setLoading(false);
        }
    }, [cursor, hasMore, loading, initialLimit]);

    const reset = () => {
        setItems([]);
        setCursor(null);
        setHasMore(true);
    };

    return { items, hasMore, loading, loadMore, reset, setItems };
};
