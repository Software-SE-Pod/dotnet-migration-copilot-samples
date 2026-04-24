import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// @ts-nocheck
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as api from '../../../api/generated';
import ContosouniversityWebformsPagesDepartmentsDepartmenteditPage from '../index';

jest.mock('../../../api/generated');

// @ts-ignore
beforeEach(() => {
  // @ts-ignore
(api.getContosouniversityWebformsPagesDepartmentsDepartmentedit).mockResolvedValue({
    instructors: [
      { instructorId: '1', fullName: 'John Doe' },
      { instructorId: '2', fullName: 'Jane Smith' }
    ],
    department: {
      id: '1',
      name: 'Math',
      budget: '10000',
      startDate: '2020-01-01',
      instructorId: '1',
      rowVersion: 'abc=='
    }
  });
  (api.submitContosouniversityWebformsPagesDepartmentsDepartmentedit).mockResolvedValue({ redirectUrl: '/departments/list' });
});

describe('Department Edit Page', () => {
  it('renders and submits form', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ContosouniversityWebformsPagesDepartmentsDepartmenteditPage />
      </QueryClientProvider>
    );
    expect(await screen.findByDisplayValue('Math')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Physics' } });
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '20000' } });
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2021-01-01' } });
    fireEvent.change(screen.getByLabelText(/Administrator/i), { target: { value: '2' } });
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => {
      expect(window.location.href).toContain('/departments/list');
    });
  });
});
