import React from 'react';
import { render, waitFor } from '@testing-library/react';
import * as api from '../../../api/generated';
import ContosouniversityWebformsPagesDepartmentsDepartmenteditPage from '../index';

jest.mock('../../../api/generated');

describe('ContosouniversityWebformsPagesDepartmentsDepartmenteditPage', () => {
  it('calls the API on mount', async () => {
    (api.getContosouniversityWebformsPagesDepartmentsDepartmentedit as jest.Mock).mockResolvedValue({});
    render(<ContosouniversityWebformsPagesDepartmentsDepartmenteditPage />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesDepartmentsDepartmentedit).toHaveBeenCalled();
    });
  });
});
