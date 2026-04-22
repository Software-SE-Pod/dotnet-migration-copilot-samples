import React from 'react';
import { render, waitFor } from '@testing-library/react';
import * as api from '../../../api/generated';
import ContosouniversityWebformsPagesReportsEnrollmentstatsPage from '../index';

jest.mock('../../../api/generated');

describe('ContosouniversityWebformsPagesReportsEnrollmentstatsPage', () => {
  it('calls getContosouniversityWebformsPagesReportsEnrollmentstats on mount', async () => {
    (api.getContosouniversityWebformsPagesReportsEnrollmentstats as jest.Mock).mockResolvedValue({});
    render(<ContosouniversityWebformsPagesReportsEnrollmentstatsPage />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesReportsEnrollmentstats).toHaveBeenCalled();
    });
  });
});
