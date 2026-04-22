import { render, waitFor } from '@testing-library/react';
import ContosouniversityWebformsPagesInstructorsInstructorlistPage from '../index';
import * as api from '../../../api/generated';

jest.mock('../../../api/generated');

describe('ContosouniversityWebformsPagesInstructorsInstructorlistPage', () => {
  it('calls getContosouniversityWebformsPagesInstructorsInstructorlist on mount', async () => {
    (api.getContosouniversityWebformsPagesInstructorsInstructorlist as jest.Mock).mockResolvedValue({});
    render(<ContosouniversityWebformsPagesInstructorsInstructorlistPage />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesInstructorsInstructorlist).toHaveBeenCalled();
    });
  });
});
