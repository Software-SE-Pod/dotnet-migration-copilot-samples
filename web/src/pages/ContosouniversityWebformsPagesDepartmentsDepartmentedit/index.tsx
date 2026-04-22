import React from 'react';
import { getContosouniversityWebformsPagesDepartmentsDepartmentedit } from '../../api/generated';

const ContosouniversityWebformsPagesDepartmentsDepartmenteditPage = () => {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesDepartmentsDepartmentedit({}).then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default ContosouniversityWebformsPagesDepartmentsDepartmenteditPage;
