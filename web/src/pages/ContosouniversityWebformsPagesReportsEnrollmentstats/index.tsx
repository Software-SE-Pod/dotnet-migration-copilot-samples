import React from 'react';
import { getContosouniversityWebformsPagesReportsEnrollmentstats } from '../../api/generated';

const ContosouniversityWebformsPagesReportsEnrollmentstatsPage = () => {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesReportsEnrollmentstats({}).then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default ContosouniversityWebformsPagesReportsEnrollmentstatsPage;
