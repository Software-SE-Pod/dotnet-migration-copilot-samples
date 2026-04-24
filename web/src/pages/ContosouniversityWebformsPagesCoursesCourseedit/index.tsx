import React from 'react';
import { getContosouniversityWebformsPagesCoursesCourseedit } from '../../api/generated';

const ContosouniversityWebformsPagesCoursesCourseeditPage = () => {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesCoursesCourseedit().then(setData);
  }, []);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<any>();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(['courseEdit', id], () => getContosouniversityWebformsPagesCoursesCourseedit(id));
  const mutation = useMutation(submitContosouniversityWebformsPagesCoursesCourseedit, {
    onSuccess: (result) => {
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    },
    onError: (err: any) => {
      // handle error
    }
  });

  React.useEffect(() => {
    if (data) {
      setValue('CourseID', data.courseID || '');
      setValue('Title', data.title || '');
      setValue('Credits', data.credits || '');
      setValue('DepartmentID', data.departmentID || '');
    }
  }, [data, setValue]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))}>
      <h2>{data?.courseID ? 'Edit Course' : 'Add Course'}</h2>
      <div className="form-group">
        <label htmlFor="CourseID">Course Number:</label>
        <input id="CourseID" {...register('CourseID', { required: 'Course number is required.', min: 1, max: 9999, valueAsNumber: true })} disabled={!!data?.courseID} />
        {errors.CourseID && <span>{errors.CourseID.message}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="Title">Title:</label>
        <input id="Title" maxLength={50} {...register('Title', { required: 'Title is required.' })} />
        {errors.Title && <span>{errors.Title.message}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="Credits">Credits:</label>
        <input id="Credits" type="number" {...register('Credits', { required: 'Credits is required.', min: { value: 0, message: 'Credits must be 0-5.' }, max: { value: 5, message: 'Credits must be 0-5.' }, valueAsNumber: true })} />
        {errors.Credits && <span>{errors.Credits.message}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="DepartmentID">Department:</label>
        <select id="DepartmentID" {...register('DepartmentID', { required: 'Department is required.' })}>
          <option value="">Select...</option>
          {data?.departments?.map((d: any) => (
            <option key={d.departmentID} value={d.departmentID}>{d.name}</option>
          ))}
        </select>
        {errors.DepartmentID && <span>{errors.DepartmentID.message}</span>}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isSubmitting || mutation.isLoading}>Save</button>
        <a href="/courses/courselist" className="btn-secondary">Cancel</a>
        {mutation.isError && <div className="validation-summary">{mutation.error?.message || 'Error saving course.'}</div>}
      </div>
    </form>
  );
};

export default ContosouniversityWebformsPagesCoursesCourseeditPage;
