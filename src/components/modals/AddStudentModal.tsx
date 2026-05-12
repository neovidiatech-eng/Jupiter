import { useState, useEffect } from 'react';
import { X, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import DatePickerField from '../ui/DatePickerField';
import { StudentFormData, getStudentSchema } from '../../lib/schemas/StudentSchema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlans } from '../../features/admin/hooks/usePlans';
import { useGetRanks } from '../../features/admin/hooks/useRank';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentFormData) => void;
}

export default function AddStudentModal({ isOpen, onClose, onSubmit }: AddStudentModalProps) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { data: plansData } = usePlans();
  const { data: ranksResponse } = useGetRanks();
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(getStudentSchema(t)) as any,
    defaultValues: {
      phone_code: '+20',
      status: 'approved',
      gender: 'male',
      country: 'مصر',
    }
  });
  const onFormSubmit = (data: StudentFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  const ranks = ranksResponse?.data.items || [];

  // Set first rank as default once loaded
  useEffect(() => {
    if (ranks.length > 0) {
      setValue('rankId', ranks[0].id);
    }
  }, [ranks.length, setValue]);

  if (!isOpen) return null;

  const countryCodes = [
    { code: '+20', country: t('egypt') },
    { code: '+966', country: t('saudiArabia') },
    { code: '+971', country: t('uae') },
    { code: '+965', country: t('kuwait') },
  ];

  const plans = plansData || [];
  const planOptions = [
    { value: '', label:'' },
    ...plans.map((p: any) => ({
      value: p.id,
      label: p.name,
    }))
  ];

  const rankOptions = ranks.map((r: any) => ({
    value: r.id,
    label: r.name,
  }));

  const genderOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
  ];

  const countryOptions = [
    { value: 'egypt', label: t('egypt') },
    { value: 'saudi', label: t('saudiArabia') },
    { value: 'uae', label: t('uae') },
    { value: 'kuwait', label: t('kuwait') },
  ];

  const statusOptions = [
    { value: 'approved', label: t('active') },
    { value: 'pending', label: t('pending') },
    { value: 'rejected', label: t('rejected') },
  ];

  const countryCodeOptions = countryCodes.map((c) => ({
    value: c.code,
    searchText: `${c.country} ${c.code}`,
    label: (
      <div className="flex justify-between items-center w-full">
        <span className="font-mono">{c.code}</span>
        <span className="text-gray-500 text-xs">{c.country}</span>
      </div>
    ),
  }));

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
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('addNewStudent')}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">{t('manageStudentsDescription')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
                    {errors.phone_code && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.phone_code.message}</p>}
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
                    {errors.birthDate && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.birthDate.message}</p>}
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
                    {errors.gender && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.gender.message}</p>}
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
                    {errors.country && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.country.message}</p>}
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
                    {errors.plan && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.plan.message}</p>}
                  </div>
                )}
              />
            </div>

            <Controller
              name="rankId"
              control={control}
              render={({ field }) => (
                <div className="text-start">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Rank
                  </label>
                  <CustomSelect
                    value={field.value}
                    options={rankOptions}
                    placeholder="Select student rank"
                    onChange={field.onChange}
                    className="rounded-2xl border-none bg-gray-50"
                  />
                  {errors.rankId && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.rankId.message}</p>}
                </div>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-start relative">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ${errors.password ? 'ring-red-500/20' : 'ring-transparent'} focus:ring-indigo-500/10 transition-all placeholder:text-gray-300`}
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.password.message}</p>}
              </div>

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
                    {errors.status && <p className="text-[10px] text-red-500 mt-1 ml-2 font-bold">{errors.status.message}</p>}
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
      <style dangerouslySetInnerHTML={{
        __html: `
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
