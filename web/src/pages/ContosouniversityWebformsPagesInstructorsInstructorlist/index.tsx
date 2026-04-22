import React, { useEffect, useState } from 'react';
import { getContosouniversityWebformsPagesInstructorsInstructorlist } from '../../api/generated';

const ContosouniversityWebformsPagesInstructorsInstructorlistPage = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    getContosouniversityWebformsPagesInstructorsInstructorlist({})
      .then(setData)
      .catch(() => setData(null));
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default ContosouniversityWebformsPagesInstructorsInstructorlistPage;
