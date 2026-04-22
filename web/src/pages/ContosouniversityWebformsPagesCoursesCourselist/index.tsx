import React, { useEffect, useState } from 'react';
import { getContosouniversityWebformsPagesCoursesCourselist } from '../../api/generated';

const ContosouniversityWebformsPagesCoursesCourselistPage = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    getContosouniversityWebformsPagesCoursesCourselist({})
      .then(setData)
      .catch(() => setData(null));
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default ContosouniversityWebformsPagesCoursesCourselistPage;
