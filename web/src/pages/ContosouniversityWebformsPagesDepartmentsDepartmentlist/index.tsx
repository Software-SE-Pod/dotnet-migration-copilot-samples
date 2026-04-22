import React from 'react';
import { getContosouniversityWebformsPagesDepartmentsDepartmentlist } from '../../api/generated';

const ContosouniversityWebformsPagesDepartmentsDepartmentlistPage = () => {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesDepartmentsDepartmentlist().then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default ContosouniversityWebformsPagesDepartmentsDepartmentlistPage;
