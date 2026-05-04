import { useState } from 'react';
import { X, Search, Video, ChevronDown, AlertCircle, Calendar, MonitorPlay, AlertTriangle, Clock, Bell } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSessionSchema, getMultipleSessionsSchema, SessionFormData, MultipleSessionsPayload, MultipleSessionsFormData } from '../../lib/schemas/SessionSchema';
import CustomSelect from '../ui/CustomSelect';
import { useStudents } from '../../features/admin/hooks/useStudents';
import { Student } from '../../types/student';
import { useTeacher } from '../../features/admin/hooks/useTeacher';
import { Teacher, DayOfWeek } from '../../types/scheduales';
import { useSubjects } from '../../features/admin/hooks/useSubjects';
import { useTranslation } from 'react-i18next';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: SessionFormData | MultipleSessionsPayload) => void;
}

export default function AddSessionModal({ isOpen, onClose, onAdd }: AddSessionModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const [schedulingMode, setSchedulingMode] = useState<'single' | 'batch'>('batch');
  const [meetingPlatform, setMeetingPlatform] = useState<'zoom' | 'google' | null>('zoom');

  const { data: students } = useStudents();
  const { data: instructors } = useTeacher();
  const { data: subjectsData } = useSubjects();

  const singleSchema = getSessionSchema(t);
  const batchSchema = getMultipleSessionsSchema(t);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schedulingMode === 'single' ? singleSchema : batchSchema),
    defaultValues: {
      type: 'full',
      notification_Time: '10',
      student: '',
      teacher: '',
      subject: '',
      title: '',
      description: '',
      notes: '',
      meetingLink: '',
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      duration: '60',
      monthYear: new Date().toISOString().substring(0, 7),
      selectedDays: ['Mon', 'Thu'],
    },
  });

  const watchTitle = watch('title');
  const watchSubject = watch('subject');
  const watchSelectedDays = (watch('selectedDays') as DayOfWeek[]) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[1000px] max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center">
               <Calendar className="w-6 h-6 text-[#6366f1]" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900 leading-tight">Create New Session</h2>
               <p className="text-[13px] font-semibold text-gray-400 mt-0.5">Configure and schedule learning tracks for students.</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column - Configuration */}
          <div className="w-full lg:w-[58%] p-6 md:p-8 bg-white overflow-y-auto custom-scrollbar">
             {/* Student & Instructor Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5" /> Student
                </label>
                <Controller
                  name="student"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={students?.data?.studentsData?.map((student: Student) => ({
                        value: student.id,
                        label: student.user.name
                      })) || []}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Student"
                      className={`rounded-2xl border-none bg-gray-50 ${errors.student ? 'ring-2 ring-red-500/20' : ''}`}
                    />
                  )}
                />
                {errors.student && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.student.message as string}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5" /> Instructor
                </label>
                <Controller
                  name="teacher"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={instructors?.teachers?.map((instructor: Teacher) => ({
                        value: instructor.id,
                        label: instructor.user.name
                      })) || []}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Instructor"
                      className={`rounded-2xl border-none bg-gray-50 ${errors.teacher ? 'ring-2 ring-red-500/20' : ''}`}
                    />
                  )}
                />
                {errors.teacher && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.teacher.message as string}</p>}
              </div>
            </div>
            {/* Session Title */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                <Video className="w-3.5 h-3.5" /> Session Title
              </label>
              <input 
                type="text" 
                placeholder="e.g. Mathematics - Algebra Basics" 
                {...register('title')}
                className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.title ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
              />
              {errors.title && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.title.message as string}</p>}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" /> Description
              </label>
              <textarea 
                placeholder="Briefly describe the session goals..." 
                {...register('description')}
                className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.description ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none h-24`}
              />
              {errors.description && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.description.message as string}</p>}
            </div>

            {/* Subject & Session Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> Subject
                </label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={subjectsData?.subjects?.map((s: any) => ({
                        value: s.id,
                        label: language === 'ar' ? s.name_ar : s.name_en
                      })) || []}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Subject"
                      className={`rounded-2xl border-none bg-gray-50 ${errors.subject ? 'ring-2 ring-red-500/20' : ''}`}
                    />
                  )}
                />
                {errors.subject && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.subject.message as string}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Session Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={[
                        { value: 'full', label: language === 'ar' ? 'كاملة (60 د)' : 'Full (60m)' },
                        { value: 'half', label: language === 'ar' ? 'نصف (30 د)' : 'Half (30m)' }
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  )}
                />
              </div>
            </div>

            {/* Scheduling Mode Toggle */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Scheduling Mode</label>
              <div className="flex p-1 bg-gray-50 rounded-[18px]">
                <button 
                  onClick={() => setSchedulingMode('single')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-[14px] transition-all ${schedulingMode === 'single' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Single Session
                </button>
                <button 
                  onClick={() => setSchedulingMode('batch')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-[14px] transition-all ${schedulingMode === 'batch' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Batch Scheduling
                </button>
              </div>
            </div>

            {/* Batch Config Card */}
            {schedulingMode === 'batch' ? (
              <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-3xl p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900/40 mb-2 uppercase tracking-wider">Target Month</label>
                    <input 
                      type="month" 
                      {...register('monthYear')}
                      className="w-full px-4 py-3 bg-white border border-indigo-50 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    />
                    {errors.monthYear && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.monthYear.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900/40 mb-2 uppercase tracking-wider">Default Start Time</label>
                    <input 
                      type="time" 
                      {...register('startTime')}
                      className="w-full px-4 py-3 bg-white border border-indigo-50 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-900/40 mb-3 uppercase tracking-wider">Weekly Schedule</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const isSelected = watchSelectedDays.includes(day as DayOfWeek);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const current = watchSelectedDays;
                            if (isSelected) setValue('selectedDays', current.filter((d: string) => d !== day));
                            else setValue('selectedDays', [...current, day]);
                          }}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                              : 'bg-white border-transparent text-gray-500 hover:border-indigo-100'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                  {errors.selectedDays && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.selectedDays.message as string}</p>}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-3xl p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900/40 mb-2 uppercase tracking-wider">Session Date</label>
                    <input 
                      type="date" 
                      {...register('sessionDate')}
                      className="w-full px-4 py-3 bg-white border border-emerald-50 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {errors.sessionDate && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.sessionDate.message as string}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900/40 mb-2 uppercase tracking-wider">Start</label>
                      <input 
                        type="time" 
                        {...register('startTime')}
                        className="w-full px-4 py-2 bg-white border border-emerald-50 rounded-2xl text-sm font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900/40 mb-2 uppercase tracking-wider">End</label>
                      <input 
                        type="time" 
                        {...register('endTime')}
                        className="w-full px-4 py-2 bg-white border border-emerald-50 rounded-2xl text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification & Custom Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Bell className="w-3.5 h-3.5" /> Notification
                </label>
                <Controller
                  name="notification_Time"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={[
                        { value: '10', label: language === 'ar' ? 'قبل 10 دقائق' : '10 minutes before' },
                        { value: '30', label: language === 'ar' ? 'قبل 30 دقيقة' : '30 minutes before' },
                        { value: '60', label: language === 'ar' ? 'قبل ساعة' : '1 hour before' }
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  )}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <MonitorPlay className="w-3.5 h-3.5" /> Custom Link
                </label>
                <input 
                  type="url" 
                  placeholder="https://zoom.us/..." 
                  {...register('meetingLink')}
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.meetingLink ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                  dir="ltr"
                />
                {errors.meetingLink && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.meetingLink.message as string}</p>}
              </div>
            </div>

            {/* Meeting Platform buttons */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Meeting Platform</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Apply to all</span>
                  <div className="w-8 h-4.5 bg-indigo-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setMeetingPlatform('zoom')}
                  className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                    meetingPlatform === 'zoom' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]' 
                      : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-100'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Zoom Meet
                </button>
                <button 
                  onClick={() => setMeetingPlatform('google')}
                  className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                    meetingPlatform === 'google' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]' 
                      : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-100'
                  }`}
                >
                  <MonitorPlay className="w-4 h-4" />
                  Google Meet
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-2">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" /> Private Notes
              </label>
              <textarea 
                placeholder="Add any internal notes..." 
                {...register('notes')}
                className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.notes ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none h-24`}
              />
              {errors.notes && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.notes.message as string}</p>}
            </div>

          </div>

          {/* Right Column - Schedule Preview */}
          <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100/80 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-gray-900 text-sm">Schedule Preview</h3>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                12 Sessions
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              
              {/* Card 1 */}
              <div className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 shadow-sm hover:border-gray-200 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-gray-100/50">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Oct</span>
                  <span className="text-sm font-black text-gray-900">24</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-gray-900">{watchTitle || 'Session 01'} - {subjectsData?.subjects?.find((s: any) => s.id === watchSubject)?.[language === 'ar' ? 'name_ar' : 'name_en'] || 'Mathematics'}</h4>
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 text-[8px] font-black uppercase tracking-widest rounded shadow-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-bold text-gray-400">02:00 PM - Room 402</span>
                  </div>
                </div>
              </div>

              {/* Card 2 - Conflict */}
              <div className="bg-red-50/30 border border-red-300 rounded-2xl p-3 flex gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-red-100">
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Oct</span>
                  <span className="text-sm font-black text-red-600">26</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-gray-900">{watchTitle || 'Session 02'} - {subjectsData?.subjects?.find((s: any) => s.id === watchSubject)?.[language === 'ar' ? 'name_ar' : 'name_en'] || 'Mathematics'}</h4>
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider rounded flex items-center gap-1 shadow-sm">
                      <AlertTriangle className="w-2.5 h-2.5" /> Clash Detected
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                       Room 402 Occupied
                    </span>
                  </div>
                  <button className="text-[10px] font-bold text-[#6366f1] hover:underline mt-1.5">
                    Relocate to Room 10B
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 shadow-sm hover:border-gray-200 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-gray-100/50">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Oct</span>
                  <span className="text-sm font-black text-gray-900">31</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-gray-900">{watchTitle || 'Session 03'} - {subjectsData?.subjects?.find((s: any) => s.id === watchSubject)?.[language === 'ar' ? 'name_ar' : 'name_en'] || 'Mathematics'}</h4>
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 text-[8px] font-black uppercase tracking-widest rounded shadow-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-bold text-gray-400">02:00 PM - Room 402</span>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 shadow-sm hover:border-gray-200 transition-all">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-gray-100/50">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nov</span>
                  <span className="text-sm font-black text-gray-900">02</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-gray-900">{watchTitle || 'Session 04'} - {subjectsData?.subjects?.find((s: any) => s.id === watchSubject)?.[language === 'ar' ? 'name_ar' : 'name_en'] || 'Mathematics'}</h4>
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 text-[8px] font-black uppercase tracking-widest rounded shadow-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-bold text-gray-400">02:00 PM - Room 402</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 pb-6">
                <button className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline flex items-center justify-center gap-1 w-full transition-colors">
                  View 8 more sessions <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-red-500 bg-red-50 px-4 py-2 rounded-full border border-red-100">
             <AlertTriangle className="w-4 h-4" />
             <span className="text-[11px] font-bold tracking-tight">1 Potential Conflict Detected</span>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all"
            >
              Save Draft
            </button>
            <button 
              onClick={handleSubmit((data) => {
                if (schedulingMode === 'single') {
                  onAdd(data as SessionFormData);
                } else {
                  // Format batch payload
                  const batchData: MultipleSessionsPayload = {
                    formData: data as MultipleSessionsFormData,
                    selectedDays: watchSelectedDays as DayOfWeek[],
                    sessions: [
                      { date: `${data.monthYear}-01`, day: watchSelectedDays[0] || 'Mon', time: data.startTime }
                    ]
                  };
                  onAdd(batchData);
                }
              })}
              className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95"
            >
              {schedulingMode === 'single' ? 'Create Session' : 'Schedule Batch'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
