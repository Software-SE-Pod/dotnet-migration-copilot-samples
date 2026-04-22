import { render, waitFor } from '@testing-library/react';
import ContosouniversityWebformsPagesStudentsStudenteditPage from '../index';
import * as api from '../../../api/generated';

jest.mock('../../../api/generated');

test('calls getContosouniversityWebformsPagesStudentsStudentedit on mount', async () => {
  (api.getContosouniversityWebformsPagesStudentsStudentedit as jest.Mock).mockResolvedValue({});
  render(<ContosouniversityWebformsPagesStudentsStudenteditPage />);
  await waitFor(() => {
    expect(api.getContosouniversityWebformsPagesStudentsStudentedit).toHaveBeenCalled();
  });
});
