import React from 'react';
import { Client } from '../../api/generated';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Props = { client?: Client };
const ContosouniversityWebformsPagesDepartmentsDepartmenteditPage = ({ client: injectedClient }: Props) => {
  

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const queryClient = useQueryClient();
  // TODO: Replace with actual id source (e.g., from route params)
  const id = 1;
  const client = injectedClient || new Client();
  const { data, isLoading, error } = useQuery({
    queryKey: ['department-edit', id],
    queryFn: () => client.getContosouniversityWebformsPagesDepartmentsDepartmentedit(id),
    enabled: !!id
  });
  const mutation = useMutation({
    mutationFn: (body: any) => client.submitContosouniversityWebformsPagesDepartmentsDepartmentedit(body),
    onSuccess: (result) => {
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    },
    onError: (err: any) => {
      if (err.response?.data?.concurrencyError) {
        setConcurrencyError(err.response.data.concurrencyError);
      }
    }
  });
  const [concurrencyError, setConcurrencyError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (data) {
      setValue('name', (data as any).name || '');
      setValue('budget', (data as any).budget || '');
      setValue('startDate', (data as any).startDate || '');
      setValue('instructorId', (data as any).instructorId || '');
      setValue('rowVersion', (data as any).rowVersion || '');
    }
  }, [data, setValue]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading department.</div>;

  return (
    <form onSubmit={handleSubmit((formData) => {
      mutation.mutate({
        id: data?.id,
        name: formData.name,
        budget: formData.budget,
        startDate: formData.startDate,
        instructorId: formData.instructorId,
        rowVersion: formData.rowVersion
      });
    })}>
      <h2>{(data as any)?.id ? 'Edit Department' : 'Add Department'}</h2>
      {concurrencyError && <div className="error-message">{concurrencyError}</div>}
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input id="name" {...register('name', { required: 'Name is required.' })} maxLength={50} />
        {errors.name && <span className="validation-summary">{errors.name.message as string}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="budget">Budget:</label>
        <input id="budget" type="number" step="0.01" {...register('budget', { required: 'Budget is required.', min: 0, max: 1000000000 })} />
        {errors.budget && <span className="validation-summary">{errors.budget.message as string}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="startDate">Start Date:</label>
        <input id="startDate" type="date" {...register('startDate', { required: 'Start date is required.' })} />
        {errors.startDate && <span className="validation-summary">{errors.startDate.message as string}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="instructorId">Administrator:</label>
        <select id="instructorId" {...register('instructorId')}>
          <option value="">-- None --</option>
          {(data as any)?.instructors?.map((i: any) => (
            <option key={i.instructorId} value={i.instructorId}>{i.fullName}</option>
          ))}
        </select>
      </div>
      <input id="rowVersion" type="hidden" {...register('rowVersion')} />
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Save</button>
        <a href="/departments" className="btn-secondary">Cancel</a>
      </div>
    </form>
  );
};

export default ContosouniversityWebformsPagesDepartmentsDepartmenteditPage;
