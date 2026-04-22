import { render, waitFor } from '@testing-library/react';
import ContosouniversityWebformsPagesAdminDashboardPage from '../index';
import * as api from '../../../api/generated';

jest.mock('../../../api/generated');

describe('ContosouniversityWebformsPagesAdminDashboardPage', () => {
  it('calls getContosouniversityWebformsPagesAdminDashboard', async () => {
    (api.getContosouniversityWebformsPagesAdminDashboard as jest.Mock).mockResolvedValue({});
    render(<ContosouniversityWebformsPagesAdminDashboardPage />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesAdminDashboard).toHaveBeenCalled();
    });
  });
});
