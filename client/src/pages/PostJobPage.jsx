import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function PostJobPage() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        city: '',
        state: '',
        salaryMin: '',
        salaryMax: '',
        salaryType: 'monthly',
        jobType: 'full-time',
        shift: 'day',
        experienceMin: 0,
        skills: '',
        gender: 'any',
        benefits: '',
        vacancies: 1
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const jobData = {
                ...formData,
                skills:
                    formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                benefits:
                    formData.benefits.split(',').map(b => b.trim()).filter(Boolean),
                salaryMin: Number(formData.salaryMin),
                salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
                experienceMin: Number(formData.experienceMin),
                vacancies: Number(formData.vacancies)
            };
            const response = await axios.post('/api/jobs', jobData, { headers: { Authorization: `Bearer ${token}` } });
            console.log(response.data);
            navigate('/');
        } catch (error) {
            setError(err.response?.data?.error || 'Failed to post job');
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <>

        </>
    )
}

export default PostJobPage