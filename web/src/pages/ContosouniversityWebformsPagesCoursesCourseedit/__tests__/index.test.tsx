import React from 'react';
import { render, waitFor } from '@testing-library/react';
import * as api from '../../../api/generated';
import Page from '../index';

jest.mock('../../../api/generated');

describe('ContosouniversityWebformsPagesCoursesCourseeditPage', () => {
  it('calls getContosouniversityWebformsPagesCoursesCourseedit on mount', async () => {
    (api.getContosouniversityWebformsPagesCoursesCourseedit as jest.Mock).mockResolvedValue({});
    render(<Page />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesCoursesCourseedit).toHaveBeenCalled();
    });
  });
});
