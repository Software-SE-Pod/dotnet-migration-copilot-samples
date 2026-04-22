import React from 'react';
import { getContosouniversityWebformsPagesStudentsStudentlist } from '../../api/generated';

export default function ContosouniversityWebformsPagesStudentsStudentlistPage() {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesStudentsStudentlist().then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
