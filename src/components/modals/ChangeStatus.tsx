import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Activity, Loader2 } from 'lucide-react';
import { Schedule } from '../../types/scheduales';
import { useUpdateSessionStatus } from '../../features/admin/hooks/useSchedules';
import { SessionStatusValue } from '../../types/sessions';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Schedule;
}

const STATUS_OPTIONS: { value: SessionStatusValue; labelEn: string; labelAr: string }[] = [
  { value: 'planned', labelEn: 'Planned', labelAr: 'مخطط' },
  { value: 'scheduled', labelEn: 'Scheduled', labelAr: 'مجدول' },
  { value: 'ongoing', labelEn: 'Ongoing', labelAr: 'جاري' },
  { value: 'completed', labelEn: 'Completed', labelAr: 'مكتمل' },
  { value: 'missed', labelEn: 'Missed', labelAr: 'فائت' },
  { value: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي' },
];

export default function ChangeStatusModal({
  isOpen,
  onClose,
  session,
}: ChangeStatusModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  const [selectedStatus, setSelectedStatus] = useState<SessionStatusValue>(
    (session.status as SessionStatusValue) || 'planned'
  );

  const { mutate: updateStatus, isPending } = useUpdateSessionStatus();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || selectedStatus === session.status) {
      onClose();
      return;
    }
    updateStatus(
      { id: session.id, payload: { status: selectedStatus } },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'تغيير حالة الجلسة' : 'Change Session Status'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          <form id="change-status-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'اختر الحالة الجديدة' : 'Select New Status'}
              </label>
              
              <div className="relative">
                <select
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as SessionStatusValue)}
                  required
                >
                  <option value="" disabled>
                    {language === 'ar' ? 'اختر حالة...' : 'Select a status...'}
                  </option>
                  {STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption.value} value={statusOption.value}>
                      {language === 'ar' ? statusOption.labelAr : statusOption.labelEn}
                      {statusOption.value === session.status ? (language === 'ar' ? ' (الحالي)' : ' (Current)') : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="change-status-form"
            disabled={isPending || !selectedStatus || selectedStatus === session.status}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
