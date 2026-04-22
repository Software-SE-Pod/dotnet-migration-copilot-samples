import React from 'react';
import { getContosouniversityWebformsPagesAdminDashboard } from '../../api/generated';

export default function ContosouniversityWebformsPagesAdminDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesAdminDashboard().then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
