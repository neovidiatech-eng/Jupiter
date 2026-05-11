import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Video,
  ChevronDown,
  AlertCircle,
  Calendar,
  MonitorPlay,
  AlertTriangle,
  Clock,
  BookOpen,
  Layers,
} from 'lucide-react';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  getSessionSchema,
  getMultipleSessionsSchema,
  SessionFormData,
  MultipleSessionsPayload,
  MultipleSessionsFormData,
} from '../../lib/schemas/SessionSchema';

import CustomSelect from '../ui/CustomSelect';

import { useStudents } from '../../features/admin/hooks/useStudents';
import { useTeacher } from '../../features/admin/hooks/useTeacher';
import { useCourses } from '../../hooks/useCourses';

import { Student } from '../../types/student';
import { Teacher, DayOfWeek } from '../../types/scheduales';
import { Course } from '../../types/courses';

import { useTranslation } from 'react-i18next';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: SessionFormData | MultipleSessionsPayload) => void;
}

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function AddSessionModal({
  isOpen,
  onClose,
  onAdd,
}: AddSessionModalProps) {
  const { t, i18n } = useTranslation();

  const language = i18n.language.split('-')[0];

  const [schedulingMode, setSchedulingMode] = useState<'single' | 'batch'>(
    'batch'
  );

  const { data: students } = useStudents();
  const { data: instructors } = useTeacher();
  const { data: coursesdata } = useCourses();

  const singleSchema = getSessionSchema(t);
  const batchSchema = getMultipleSessionsSchema(t);

  const courses: Course[] = coursesdata?.items || [];

  const courseOptions = courses.map((course: Course) => ({
    value: String(course.id),
    label: course.title,
  }));

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(
      schedulingMode === 'single' ? singleSchema : batchSchema
    ),
    defaultValues: {
      type: 'full',
      notification_Time: '10',
      studentId: '',
      teacherId: '',
      courseId: '',
      title: '',
      description: '',
      notes: '',
      platform: 'zoom',
      link: '',
      videoUrl: '',
      slidesUrl: '',
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      duration: '60',
      monthYear: new Date().toISOString().substring(0, 7),
      selectedDays: [],
      language: language === 'ar' ? 'ar' : 'en',
    },
  });

  const watchTitle = watch('title');
  const watchCourse = watch('courseId');
  const watchStudent = watch('studentId');
  const watchType = watch('type');
  const watchStartTime = watch('startTime');
  const watchPlatform = watch('platform');

  const watchSelectedDays =
    (watch('selectedDays') as DayOfWeek[]) || [];

  useEffect(() => {
    if (!watchStartTime || !watchType) return;

    const durationMinutes = watchType === 'full' ? 60 : 30;

    setValue('duration', String(durationMinutes));

    const [hours, minutes] = watchStartTime
      .split(':')
      .map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    date.setMinutes(date.getMinutes() + durationMinutes);

    const endHours = String(date.getHours()).padStart(2, '0');

    const endMinutes = String(date.getMinutes()).padStart(2, '0');

    setValue('endTime', `${endHours}:${endMinutes}`);
  }, [watchStartTime, watchType, setValue]);

  const selectedStudentData = useMemo(() => {
    if (!watchStudent || !students?.data?.studentsData) return null;

    return (
      students.data.studentsData.find(
        (s: Student) => String(s.id) === String(watchStudent)
      ) || null
    );
  }, [watchStudent, students]);

  const studentPlanInfo = useMemo(() => {
    if (!selectedStudentData) return null;

    return {
      planName: selectedStudentData.plan?.name || null,
      totalSessions: selectedStudentData.sessions || 0,
      sessionsAttended:
        selectedStudentData.sessions_attended || 0,
      sessionsRemaining:
        selectedStudentData.sessions_remaining || 0,
    };
  }, [selectedStudentData]);

  const selectedCourse = useMemo(() => {
    return (
      courses.find(
        (course: Course) =>
          String(course.id) === String(watchCourse)
      ) || null
    );
  }, [courses, watchCourse]);

  const previewSessions = useMemo(() => {
    if (schedulingMode === 'single') {
      return [
        {
          date: watch('sessionDate'),
          available: true,
        },
      ];
    }

    const sessions: {
      date: string;
      available: boolean;
    }[] = [];

    if (!watchSelectedDays.length) return sessions;

    const [year, month] = watch('monthYear')
      .split('-')
      .map(Number);

    const currentDate = new Date(year, month - 1, 1);

    while (currentDate.getMonth() === month - 1) {
      const currentDay = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      }) as DayOfWeek;

      if (watchSelectedDays.includes(currentDay)) {
        sessions.push({
          date: currentDate.toISOString(),
          available: Math.random() > 0.2,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sessions;
  }, [
    schedulingMode,
    watchSelectedDays,
    watch,
  ]);

  const formatDateCard = (date: string) => {
    const d = new Date(date);

    return {
      month: d.toLocaleDateString('en-US', {
        month: 'short',
      }),
      day: d.getDate(),
    };
  };

  const onSubmit = (data: any) => {
    if (schedulingMode === 'single') {
      onAdd(data as SessionFormData);
    } else {
      const batchData: MultipleSessionsPayload = {
        formData: data as MultipleSessionsFormData,
        selectedDays: watchSelectedDays,
        sessions: previewSessions.map((session) => ({
          date: session.date,
          day: new Date(session.date).toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
            }
          ) as DayOfWeek,
          time: data.startTime,
        })),
      };

      onAdd(batchData);
    }

    reset();

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] max-h-[92vh] overflow-hidden bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Create New Session
              </h2>

              <p className="text-sm text-gray-400">
                Configure and schedule sessions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row overflow-hidden"
        >

          {/* LEFT */}
          <div className="w-full lg:w-[58%] p-8 overflow-y-auto custom-scrollbar">

            {/* Student + Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* Student */}
              <div>
                <label className="label">
                  <Search className="w-3.5 h-3.5" />
                  Student
                </label>

                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={
                        students?.data?.studentsData?.map(
                          (student: Student) => ({
                            value: String(student.id),
                            label: student.user.name,
                          })
                        ) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Student"
                    />
                  )}
                />

                {errors.studentId && (
                  <p className="error-text">
                    {errors.studentId.message as string}
                  </p>
                )}
              </div>

              {/* Teacher */}
              <div>
                <label className="label">
                  <Search className="w-3.5 h-3.5" />
                  Instructor
                </label>

                <Controller
                  name="teacherId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={
                        instructors?.teachers?.map(
                          (teacher: Teacher) => ({
                            value: String(teacher.id),
                            label: teacher.user.name,
                          })
                        ) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Instructor"
                    />
                  )}
                />

                {errors.teacherId && (
                  <p className="error-text">
                    {errors.teacherId.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Plan Card */}
            {selectedStudentData && studentPlanInfo && (
              <div className="mb-6 p-4 rounded-3xl border border-indigo-100 bg-indigo-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-indigo-600" />

                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Student Plan
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Plan
                    </p>

                    <p className="font-bold text-sm">
                      {studentPlanInfo.planName ||
                        'No Plan'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Remaining
                    </p>

                    <p className="font-black text-emerald-600">
                      {studentPlanInfo.sessionsRemaining}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Attended
                    </p>

                    <p className="font-black text-amber-500">
                      {studentPlanInfo.sessionsAttended}
                    </p>
                  </div>

                  
                </div>
              </div>
            )}

            {/* Title */}
            <div className="mb-6">
              <label className="label">
                <Video className="w-3.5 h-3.5" />
                Session Title
              </label>

              <input
                type="text"
                {...register('title')}
                placeholder="Session Title"
                className="input"
              />

              {errors.title && (
                <p className="error-text">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="label">
                <AlertCircle className="w-3.5 h-3.5" />
                Description
              </label>

              <textarea
                {...register('description')}
                placeholder="Description..."
                className="textarea"
              />

              {errors.description && (
                <p className="error-text">
                  {errors.description.message as string}
                </p>
              )}
            </div>

            {/* Subject + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* Subject */}
              <div>
                <label className="label">
                  <BookOpen className="w-3.5 h-3.5" />
                  course
                </label>

                <Controller
                  name="courseId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={courseOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Subject"
                    />
                  )}
                />

                {errors.courseId && (
                  <p className="error-text">
                    {errors.courseId.message as string}
                  </p>
                )}
              </div>

              {/* Type + Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {/* Type */}
                <div>
                  <label className="label">
                    <Clock className="w-3.5 h-3.5" />
                    Session Type
                  </label>

                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        options={[
                          {
                            value: 'full',
                            label: 'Full (60m)',
                          },
                          {
                            value: 'half',
                            label: 'Half (30m)',
                          },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="label">
                    <Layers className="w-3.5 h-3.5" />
                    Language
                  </label>

                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'ar', label: 'Arabic' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() =>
                    setSchedulingMode('single')
                  }
                  className={`toggle-btn ${
                    schedulingMode === 'single'
                      ? 'active-toggle'
                      : ''
                  }`}
                >
                  Single
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSchedulingMode('batch')
                  }
                  className={`toggle-btn ${
                    schedulingMode === 'batch'
                      ? 'active-toggle'
                      : ''
                  }`}
                >
                  Batch
                </button>
              </div>
            </div>

            {/* SINGLE */}
            {schedulingMode === 'single' ? (
              <div className="card-box">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>
                    <label className="label">
                      Session Date
                    </label>

                    <input
                      type="date"
                      {...register('sessionDate')}
                      className="input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div>
                      <label className="label">
                        Start
                      </label>

                      <input
                        type="time"
                        {...register('startTime')}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="label">
                        End
                      </label>

                      <input
                        type="time"
                        {...register('endTime')}
                        readOnly
                        className="input bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-box">

                <div className="mb-5">
                  <label className="label">
                    Target Month
                  </label>

                  <input
                    type="month"
                    {...register('monthYear')}
                    className="input"
                  />
                </div>

                <div className="mb-5">
                  <label className="label">
                    Start Time
                  </label>

                  <input
                    type="time"
                    {...register('startTime')}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Weekly Schedule
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => {
                      const selected =
                        watchSelectedDays.includes(day);

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setValue(
                                'selectedDays',
                                watchSelectedDays.filter(
                                  (d) => d !== day
                                )
                              );
                            } else {
                              setValue(
                                'selectedDays',
                                [
                                  ...watchSelectedDays,
                                  day,
                                ]
                              );
                            }
                          }}
                          className={`day-btn ${
                            selected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Link + Video + Slides */}
            <div className="grid grid-cols-1 gap-5 mb-6">
              {/* Link */}
              <div>
                <label className="label">
                  <MonitorPlay className="w-3.5 h-3.5" />
                  Meeting Link
                </label>

                <input
                  type="url"
                  {...register('link')}
                  placeholder="https://zoom.us/j/..."
                  className="input"
                />

                {errors.link && (
                  <p className="error-text">
                    {errors.link.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Video URL */}
                <div>
                  <label className="label">
                    <Video className="w-3.5 h-3.5" />
                    Video URL
                  </label>

                  <input
                    type="url"
                    {...register('videoUrl')}
                    placeholder="Recording URL..."
                    className="input"
                  />
                </div>

                {/* Slides URL */}
                <div>
                  <label className="label">
                    <Layers className="w-3.5 h-3.5" />
                    Slides URL
                  </label>

                  <input
                    type="url"
                    {...register('slidesUrl')}
                    placeholder="Presentation URL..."
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="label">
                <AlertTriangle className="w-3.5 h-3.5" />
                Notes
              </label>

              <textarea
                {...register('notes')}
                placeholder="Private notes..."
                className="textarea"
              />
            </div>

            {/* Platform */}
            <div className="mb-6">
              <label className="label mb-3">
                Meeting Platform
              </label>

              <div className="grid grid-cols-2 gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setValue('platform', 'zoom')
                  }
                  className={`platform-btn ${
                    watchPlatform === 'zoom'
                      ? 'active-platform'
                      : ''
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Zoom
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setValue('platform', 'google')
                  }
                  className={`platform-btn ${
                    watchPlatform === 'google'
                      ? 'active-platform'
                      : ''
                  }`}
                >
                  <MonitorPlay className="w-4 h-4" />
                  Google Meet
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4">

              <button
                type="button"
                onClick={onClose}
                className="secondary-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
              >
                {schedulingMode === 'single'
                  ? 'Create Session'
                  : 'Schedule Batch'}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100 overflow-y-auto">

            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                Schedule Preview
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                {previewSessions.length} Sessions
              </p>
            </div>

            <div className="p-6 space-y-4">

              {previewSessions.length ? (
                previewSessions.map((session, index) => {
                  const date = formatDateCard(
                    session.date
                  );

                  return (
                    <div
                      key={index}
                      className={`rounded-2xl p-4 border ${
                        session.available
                          ? 'bg-white border-gray-100'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex gap-4">

                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-black text-gray-500">
                            {date.month}
                          </span>

                          <span className="font-black text-lg">
                            {date.day}
                          </span>
                        </div>

                        <div className="flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <h4 className="text-sm font-bold text-gray-900">
                              {watchTitle ||
                                'Untitled Session'}
                            </h4>

                            <span
                              className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                session.available
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {session.available
                                ? 'Available'
                                : 'Conflict'}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            {selectedCourse?.title ||
                              'No Subject'}
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            {watchStartTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-3" />

                  <p className="text-sm text-gray-400">
                    No sessions generated yet
                  </p>
                </div>
              )}

              {previewSessions.length > 5 && (
                <button
                  type="button"
                  className="w-full text-indigo-600 text-sm font-bold flex items-center justify-center gap-1"
                >
                  View More
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              .label {
                display:flex;
                align-items:center;
                gap:8px;
                font-size:11px;
                font-weight:700;
                color:#94a3b8;
                margin-bottom:8px;
                text-transform:uppercase;
                letter-spacing:.08em;
              }

              .input {
                width:100%;
                padding:12px 16px;
                border-radius:18px;
                background:#f8fafc;
                border:1px solid transparent;
                font-size:14px;
                font-weight:600;
                outline:none;
              }

              .textarea {
                width:100%;
                min-height:100px;
                padding:14px 16px;
                border-radius:18px;
                background:#f8fafc;
                border:1px solid transparent;
                resize:none;
                outline:none;
              }

              .input:focus,
              .textarea:focus {
                border-color:#c7d2fe;
                background:white;
              }

              .error-text {
                font-size:11px;
                color:#ef4444;
                margin-top:4px;
                margin-left:4px;
                font-weight:700;
              }

              .toggle-btn {
                flex:1;
                padding:10px;
                border-radius:14px;
                font-size:13px;
                font-weight:700;
                transition:.2s;
              }

              .active-toggle {
                background:white;
                color:#4f46e5;
                box-shadow:0 1px 3px rgba(0,0,0,.08);
              }

              .card-box {
                padding:24px;
                border-radius:28px;
                background:#f8fafc;
                margin-bottom:24px;
              }

              .day-btn {
                padding:10px 14px;
                border-radius:14px;
                border:1px solid #e5e7eb;
                font-size:12px;
                font-weight:700;
                transition:.2s;
              }

              .platform-btn {
                display:flex;
                align-items:center;
                justify-content:center;
                gap:8px;
                padding:14px;
                border-radius:18px;
                border:2px solid #e5e7eb;
                font-weight:700;
                transition:.2s;
              }

              .active-platform {
                background:#111827;
                color:white;
                border-color:#111827;
              }

              .primary-btn {
                background:#4f46e5;
                color:white;
                padding:12px 24px;
                border-radius:18px;
                font-weight:700;
              }

              .secondary-btn {
                background:#f3f4f6;
                color:#374151;
                padding:12px 24px;
                border-radius:18px;
                font-weight:700;
              }

              .custom-scrollbar::-webkit-scrollbar {
                width:5px;
              }

              .custom-scrollbar::-webkit-scrollbar-thumb {
                background:#cbd5e1;
                border-radius:999px;
              }
            `,
          }}
        />
      </div>
    </div>
  );
}