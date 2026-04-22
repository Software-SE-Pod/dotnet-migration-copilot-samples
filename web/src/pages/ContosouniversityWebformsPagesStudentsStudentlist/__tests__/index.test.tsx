import React from 'react';
import { render, waitFor } from '@testing-library/react';
import * as api from '../../../api/generated';
import ContosouniversityWebformsPagesStudentsStudentlistPage from '../index';

jest.mock('../../../api/generated');

test('calls getContosouniversityWebformsPagesStudentsStudentlist on mount', async () => {
  (api.getContosouniversityWebformsPagesStudentsStudentlist as jest.Mock).mockResolvedValue({});
  render(<ContosouniversityWebformsPagesStudentsStudentlistPage />);
  await waitFor(() => {
    expect(api.getContosouniversityWebformsPagesStudentsStudentlist).toHaveBeenCalled();
  });
});
