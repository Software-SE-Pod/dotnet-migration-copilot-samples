import React, { useEffect, useState } from 'react';
import { getContosouniversityWebformsPagesDefault } from '../../api/generated';

const ContosouniversityWebformsPagesDefault = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    getContosouniversityWebformsPagesDefault().then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default ContosouniversityWebformsPagesDefault;
