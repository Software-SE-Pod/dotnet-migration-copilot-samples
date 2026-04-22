import React, { useEffect, useState } from "react";
import { getContosouniversityWebformsPagesInstructorsInstructoredit } from "../../api/generated";

const Page = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    getContosouniversityWebformsPagesInstructorsInstructoredit({}).then(setData);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default Page;
