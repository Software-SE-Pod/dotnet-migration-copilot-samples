import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Client } from '../../api/generated';

const PAGE_SIZE = 15;

const ContosouniversityWebformsPagesCoursesCourselistPage = () => {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      departmentId: undefined,
      page: 0,
      pageSize: PAGE_SIZE,
    },
  });
  const departmentId = watch('departmentId');
  const page = watch('page');
  const pageSize = watch('pageSize');

  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', departmentId, page, pageSize],
    queryFn: () => new Client().getContosouniversityWebformsPagesCoursesCourselist(departmentId, page, pageSize),
    keepPreviousData: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses.</div>;
  if (!data) return <div>No data.</div>;

  const { departmentOptions, courses, totalCourses } = data;
  const totalPages = Math.ceil((totalCourses || 0) / (pageSize || PAGE_SIZE));

  return (
    <div>
      <h2>Courses</h2>
      <form>
        <label htmlFor="departmentId">Department: </label>
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <select
              id="departmentId"
              {...field}
              onChange={e => {
                setValue('departmentId', e.target.value ? Number(e.target.value) : undefined);
                setValue('page', 0);
              }}
            >
              <option value="">-- All --</option>
              {departmentOptions?.map(opt => (
                <option key={opt.departmentId} value={opt.departmentId}>
                  {opt.departmentName}
                </option>
              ))}
            </select>
          )}
        />
      </form>
      <table className="data-grid">
        <thead>
          <tr>
            <th>Number</th>
            <th>Title</th>
            <th>Credits</th>
            <th>Department</th>
            <th>Enrolled</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {courses && courses.length > 0 ? (
            courses.map(course => (
              <tr key={course.courseId}>
                <td>{course.courseId}</td>
                <td>{course.title}</td>
                <td>{course.credits}</td>
                <td>{course.departmentName}</td>
                <td>{course.enrolled}</td>
                <td>
                  <a href={`../CourseEdit.aspx?id=${course.courseId}`}>Edit</a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No courses found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="paging-controls">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setValue('page', page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => setValue('page', page + 1)}
        >
          Next
        </button>
      </div>
      <p>
        <a href="../CourseEdit.aspx">Add New Course</a>
      </p>
    </div>
  );
};

export default ContosouniversityWebformsPagesCoursesCourselistPage;
