import React from 'react';
import { getContosouniversityWebformsPagesCoursesCourseedit } from '../../api/generated';

const ContosouniversityWebformsPagesCoursesCourseeditPage = () => {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesCoursesCourseedit().then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default ContosouniversityWebformsPagesCoursesCourseeditPage;
