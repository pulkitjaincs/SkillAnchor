import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchHero from '@/components/common/SearchHero';

describe('SearchHero Component', () => {
    it('should render the search inputs and category chips', () => {
        const mockOnSearch = vi.fn();
        render(<SearchHero onSearch={mockOnSearch} />);

        expect(screen.getByPlaceholderText(/Search job titles/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/City or state/i)).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        // Check for 'All' category chip
        expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('should call onSearch when the form is submitted', () => {
        const mockOnSearch = vi.fn();
        render(<SearchHero onSearch={mockOnSearch} />);

        const keywordInput = screen.getByPlaceholderText(/Search job titles/i);
        const locationInput = screen.getByPlaceholderText(/City or state/i);
        const searchButton = screen.getByText('Search');

        fireEvent.change(keywordInput, { target: { value: 'Software Engineer' } });
        fireEvent.change(locationInput, { target: { value: 'Bangalore' } });
        fireEvent.click(searchButton);

        expect(mockOnSearch).toHaveBeenCalledWith({
            search: 'Software Engineer',
            location: 'Bangalore',
            category: '' // Default is All, which sends empty string
        });
    });

    it('should call onSearch immediately when a category chip is clicked', () => {
        const mockOnSearch = vi.fn();
        render(<SearchHero onSearch={mockOnSearch} />);

        // Assuming 'Construction' exists in JOB_CATEGORIES
        const constructionChip = screen.getByText('Construction');
        fireEvent.click(constructionChip);

        expect(mockOnSearch).toHaveBeenCalledWith({
            search: '',
            location: '',
            category: 'Construction'
        });
    });

       it('should initialize with provided search parameters', () => {
        const mockOnSearch = vi.fn();
        render(
            <SearchHero 
                onSearch={mockOnSearch} 
                initialSearchQuery="Driver" 
                initialLocation="Mumbai" 
                initialCategory="Logistics"
            />
        );

        expect(screen.getByDisplayValue('Driver')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Mumbai')).toBeInTheDocument();
        
        const logisticsChip = screen.getByText('Logistics');
        expect(logisticsChip.className).toContain('active');
    });

});
