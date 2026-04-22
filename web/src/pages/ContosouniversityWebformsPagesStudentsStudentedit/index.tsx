import { useEffect, useState } from 'react';
import { getContosouniversityWebformsPagesStudentsStudentedit } from '../../api/generated';

export default function ContosouniversityWebformsPagesStudentsStudenteditPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    getContosouniversityWebformsPagesStudentsStudentedit({}).then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
