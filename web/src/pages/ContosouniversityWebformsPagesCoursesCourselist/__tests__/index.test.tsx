import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Client } from '../../../api/generated';
import ContosouniversityWebformsPagesCoursesCourselistPage from '../index';

describe('ContosouniversityWebformsPagesCoursesCourselistPage', () => {
  it('renders course grid and department filter', async () => {
    vi.spyOn(Client.prototype, 'getContosouniversityWebformsPagesCoursesCourselist').mockImplementation(() => Promise.resolve({
      departmentOptions: [
        { departmentId: 1, departmentName: 'Math' },
        { departmentId: 2, departmentName: 'History' }
      ],
      courses: [
        {
          courseId: 101,
          title: 'Calculus',
          credits: 4,
          departmentName: 'Math',
          enrolled: 10
        },
        {
          courseId: 202,
          title: 'World History',
          credits: 3,
          departmentName: 'History',
          enrolled: 8
        }
      ],
      totalCourses: 2,
      page: 0,
      pageSize: 15
    }));
    const queryClient = new QueryClient();
    const { getByText, getByLabelText, getAllByText } = render(
      <QueryClientProvider client={queryClient}>
        <ContosouniversityWebformsPagesCoursesCourselistPage />
      </QueryClientProvider>
    );
    await waitFor(() => expect(getByLabelText('Department:')).toBeInTheDocument());
expect(getByText('Calculus')).toBeInTheDocument();
expect(getByText('World History')).toBeInTheDocument();
expect(getAllByText('Math').length).toBe(2);
expect(getAllByText('History').length).toBe(2);
expect(getByText('Add New Course')).toBeInTheDocument();
  });
});
