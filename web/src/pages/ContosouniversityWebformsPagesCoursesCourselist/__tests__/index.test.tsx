import React from 'react';
import { render, waitFor } from '@testing-library/react';
import * as api from '../../../api/generated';
import ContosouniversityWebformsPagesCoursesCourselistPage from '../index';

jest.mock('../../../api/generated');

describe('ContosouniversityWebformsPagesCoursesCourselistPage', () => {
  it('calls getContosouniversityWebformsPagesCoursesCourselist on mount', async () => {
    (api.getContosouniversityWebformsPagesCoursesCourselist as jest.Mock).mockResolvedValue({});
    render(<ContosouniversityWebformsPagesCoursesCourselistPage />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesCoursesCourselist).toHaveBeenCalled();
    });
  });
});
