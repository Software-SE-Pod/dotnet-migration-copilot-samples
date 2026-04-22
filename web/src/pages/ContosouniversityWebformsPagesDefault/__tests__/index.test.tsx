import { render, screen, waitFor } from '@testing-library/react';
import ContosouniversityWebformsPagesDefault from '../index';
import * as api from '../../../api/generated';

jest.mock('../../../api/generated');

it('calls the API on mount', async () => {
  (api.getContosouniversityWebformsPagesDefault as jest.Mock).mockResolvedValue({ studentCount: 1, courseCount: 2, departmentCount: 3 });
  render(<ContosouniversityWebformsPagesDefault />);
  await waitFor(() => expect(api.getContosouniversityWebformsPagesDefault).toHaveBeenCalled());
  expect(screen.getByText(/studentCount/)).toBeInTheDocument();
});
