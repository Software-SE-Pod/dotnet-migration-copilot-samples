import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Client } from '../../../api/generated';
import ContosouniversityWebformsPagesDepartmentsDepartmenteditPage from '../index';

jest.mock('../../../api/generated');

let clientMock: Client;
beforeEach(() => {
  clientMock = new Client();
  jest.spyOn(clientMock, 'getContosouniversityWebformsPagesDepartmentsDepartmentedit').mockResolvedValue({
    init: () => {},
    toJSON: () => ({
      id: 1,
      name: 'English',
      budget: '100000',
      startDate: new Date('2020-01-01'),
      instructorId: 2,
      instructors: [
        { instructorId: 1, fullName: 'Jane Doe' },
        { instructorId: 2, fullName: 'John Smith' }
      ],
      rowVersion: 'abc=='
    }),
    id: 1,
    name: 'English',
    budget: '100000',
    startDate: new Date('2020-01-01'),
    instructorId: 2,
    instructors: [
      { instructorId: 1, fullName: 'Jane Doe' },
      { instructorId: 2, fullName: 'John Smith' }
    ],
    rowVersion: 'abc=='
  } as any);
  jest.spyOn(clientMock, 'submitContosouniversityWebformsPagesDepartmentsDepartmentedit').mockResolvedValue({
    init: () => {},
    toJSON: () => ({ redirectUrl: '/departments' }),
    redirectUrl: '/departments'
  } as any);
});

describe('Department Edit Page', () => {
  it('renders and submits form', async () => {
    const queryClient = new QueryClient();
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };
    render(
      <QueryClientProvider client={queryClient}>
        <ContosouniversityWebformsPagesDepartmentsDepartmenteditPage client={clientMock as any} />
      </QueryClientProvider>
    );
    expect(await screen.findByDisplayValue('English')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '200000' } });
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => {
      expect(window.location.href).toContain('/departments');
    });
  });
});
