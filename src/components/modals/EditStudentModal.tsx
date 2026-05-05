import { X, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { StudentFormData, getStudentSchema } from '../../lib/schemas/StudentSchema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlans } from '../../features/admin/hooks/usePlans';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData & { id: string }) => void;
  studentData: StudentFormData & { id: string } | null;
}

export default function EditStudentModal({
  isOpen,
  onClose,
  onSubmit,
  studentData,
}: EditStudentModalProps) {
  const { language, t } = useLanguage();
  const { data: plansData } = usePlans();

  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(getStudentSchema(t)),
    defaultValues: studentData || undefined,
  });

  useEffect(() => {
    if (isOpen && studentData) {
      reset(studentData);
    }
  }, [isOpen, studentData, reset]);

  if (!isOpen || !studentData) return null;


  const handleEditSubmit = (data: StudentFormData) => {
    const cleanedData = { ...data };
    if (!cleanedData.password) {
      delete cleanedData.password;
    }

    onSubmit({ ...cleanedData, id: studentData!.id });
    onClose();
  };
  const countryCodes = [
    { code: '+20', country: 'مصر', countryEn: 'Egypt' },
    { code: '+966', country: 'السعودية', countryEn: 'Saudi Arabia' },
    { code: '+971', country: 'الإمارات', countryEn: 'UAE' },
    { code: '+965', country: 'الكويت', countryEn: 'Kuwait' },
  ];

  const countryCodeOptions = countryCodes.map((c) => ({
    value: c.code,
    label: (
      <div className="flex justify-between items-center w-full" dir="ltr">
        <span className="font-mono">{c.code}</span>
        <span className="text-gray-500 text-xs">{language === 'ar' ? c.country : c.countryEn}</span>
      </div>
    ),
  }));

  const genderOptions = [
    { value: 'male', label: language === 'ar' ? 'ذكر' : 'Male' },
    { value: 'female', label: language === 'ar' ? 'أنثى' : 'Female' },
  ];

  const countryOptions = [
    { value: 'egypt', label: language === 'ar' ? 'مصر' : 'Egypt' },
    { value: 'saudi', label: language === 'ar' ? 'السعودية' : 'Saudi Arabia' },
  ];

  const planOptions = [
    ...(plansData || []).map((p: any) => ({
      value: p.id,
      label: p.name || (language === 'ar' ? p.name_ar : p.name_en),
    }))
  ];

  const statusOptions = [
    { value: 'approved', label: language === 'ar' ? 'نشط' : 'Active' },
    { value: 'pending', label: language === 'ar' ? 'قيد الانتظار' : 'Pending' },
    { value: 'rejected', label: language === 'ar' ? 'مرفوض' : 'Rejected' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('editStudent')}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">{t('manageStudentsDescription')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                   {t('name')} *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="ex :- Mohamed"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.name ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.name.message}</p>}
              </div>

              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  required
                  {...register('email')}
                  placeholder="ex :- student@example.com"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.email ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                  dir="ltr"
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="ex :- 01091536978"
                  className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.phone ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                  dir="ltr"
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.phone.message}</p>}
              </div>

              <Controller
                name="phone_code"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('countryCode')}</label>
                    <CustomSelect
                      value={field.value}
                      options={countryCodeOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  </div>
                )}
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('country')}</label>
                    <CustomSelect
                      value={field.value}
                      options={countryOptions}
                      placeholder={t('selectCountry')}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  </div>
                )}
              />
              <Controller
                name="plan"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('studyPlan')}</label>
                    <CustomSelect
                      value={field.value}
                      options={planOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('status')}</label>
                    <CustomSelect
                      value={field.value}
                      options={statusOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('birthDate')}</label>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  </div>
                )}
              />

              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <div className="text-start">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('gender')}</label>
                    <CustomSelect
                      value={field.value}
                      options={genderOptions}
                      onChange={field.onChange}
                      className="rounded-2xl border-none bg-gray-50"
                    />
                  </div>
                )}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-gray-100 bg-white/80 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit" 
                className="flex-1 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95"
              >
                {t('save')}
              </button>
            </div>
          </form>
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
