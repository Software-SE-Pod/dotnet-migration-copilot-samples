import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ContosouniversityWebformsPagesDepartmentsDepartmentlistPage from '../index';
import * as api from '../../../api/generated';

jest.mock('../../../api/generated');

describe('ContosouniversityWebformsPagesDepartmentsDepartmentlistPage', () => {
  it('calls getContosouniversityWebformsPagesDepartmentsDepartmentlist', async () => {
    (api.getContosouniversityWebformsPagesDepartmentsDepartmentlist as jest.Mock).mockResolvedValue({});
    render(<ContosouniversityWebformsPagesDepartmentsDepartmentlistPage />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesDepartmentsDepartmentlist).toHaveBeenCalled();
    });
  });
});
