import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Page from '../index';

jest.mock('../../../api/generated', () => ({
  getContosouniversityWebformsPagesCoursesCourseedit: jest.fn(() => Promise.resolve({
    courseID: 1,
    title: 'Calculus',
    credits: 3,
    departmentID: 2,
    departments: [
      { departmentID: 1, name: 'Math' },
      { departmentID: 2, name: 'Science' }
    ]
  })),
  submitContosouniversityWebformsPagesCoursesCourseedit: jest.fn(() => Promise.resolve({ redirectUrl: '/courses/courselist' }))
}));

describe('CourseEditPage', () => {
  it('renders and submits form', async () => {
    const queryClient = new QueryClient();
    delete window.location;
    window.location = { href: '' } as any;
    render(
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    );
    expect(await screen.findByDisplayValue('Calculus')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Algebra' } });
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => expect(window.location.href).toContain('/courses/courselist'));
  });
});
