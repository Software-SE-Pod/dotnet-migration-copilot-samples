import React from 'react';
import { getContosouniversityWebformsPagesDepartmentsDepartmentedit } from '../../api/generated';

const ContosouniversityWebformsPagesDepartmentsDepartmenteditPage = () => {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    getContosouniversityWebformsPagesDepartmentsDepartmentedit({}).then(setData);
  }, []);
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(['departmentEdit', id], () => getContosouniversityWebformsPagesDepartmentsDepartmentedit({ id }), { enabled: !!id });
  const mutation = useMutation(submitContosouniversityWebformsPagesDepartmentsDepartmentedit, {
    onSuccess: (resp) => {
      if (resp.redirectUrl) {
        window.location.href = resp.redirectUrl;
      }
    }
  });

  useEffect(() => {
    if (data && data.department) {
      reset({
        name: data.department.name,
        budget: data.department.budget,
        startDate: data.department.startDate,
        instructorId: data.department.instructorId || '',
        rowVersion: data.department.rowVersion
      });
    }
  }, [data, reset]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading department.</div>;

  return (
    <form onSubmit={handleSubmit((formData) => {
      mutation.mutate({
        id: data?.department?.id || null,
        name: formData.name,
        budget: formData.budget,
        startDate: formData.startDate,
        instructorId: formData.instructorId,
        rowVersion: formData.rowVersion
      });
    })}>
      <h2>{data?.department ? 'Edit Department' : 'Add Department'}</h2>
      {mutation.isError && <div className="validation-summary">{mutation.error?.response?.data?.title || 'Error'}</div>}
      {mutation.data?.concurrencyError && <div className="error-message">{mutation.data.concurrencyError}</div>}
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input id="name" {...register('name', { required: 'Name is required.' })} maxLength={50} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="budget">Budget:</label>
        <input id="budget" type="number" step="0.01" {...register('budget', { required: 'Budget is required.', min: 0 })} />
        {errors.budget && <span>{errors.budget.message}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="startDate">Start Date:</label>
        <input id="startDate" type="date" {...register('startDate', { required: 'Start date is required.' })} />
        {errors.startDate && <span>{errors.startDate.message}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="instructorId">Administrator:</label>
        <select id="instructorId" {...register('instructorId')}>
          <option value="">-- None --</option>
          {data?.instructors?.map((i: any) => (
            <option key={i.instructorId} value={i.instructorId}>{i.fullName}</option>
          ))}
        </select>
      </div>
      <input type="hidden" {...register('rowVersion')} />
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={mutation.isLoading}>Save</button>
        <a href="/departments/list" className="btn-secondary">Cancel</a>
      </div>
    </form>
  );
};

export default ContosouniversityWebformsPagesDepartmentsDepartmenteditPage;
