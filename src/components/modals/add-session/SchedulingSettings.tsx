import { DayOfWeek } from '../../../types/scheduales';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface SchedulingSettingsProps {
  schedulingMode: 'single' | 'batch';
  setSchedulingMode: (mode: 'single' | 'batch') => void;
  register: UseFormRegister<any>;
  watchSelectedDays: DayOfWeek[];
  setValue: UseFormSetValue<any>;
  DAYS: DayOfWeek[];
}

export default function SchedulingSettings({
  schedulingMode,
  setSchedulingMode,
  register,
  watchSelectedDays,
  setValue,
  DAYS,
}: SchedulingSettingsProps) {
  return (
    <>
      {/* Toggle */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setSchedulingMode('single')}
            className={`toggle-btn ${
              schedulingMode === 'single' ? 'active-toggle' : ''
            }`}
          >
            Single
          </button>

          <button
            type="button"
            onClick={() => setSchedulingMode('batch')}
            className={`toggle-btn ${
              schedulingMode === 'batch' ? 'active-toggle' : ''
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
              <label className="label">Session Date</label>
              <input
                type="date"
                {...register('sessionDate')}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start</label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="input"
                />
              </div>

              <div>
                <label className="label">End</label>
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
            <label className="label">Target Month</label>
            <input type="month" {...register('monthYear')} className="input" />
          </div>

          <div className="mb-5">
            <label className="label">Start Time</label>
            <input type="time" {...register('startTime')} className="input" />
          </div>

          <div>
            <label className="label">Weekly Schedule</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const selected = watchSelectedDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setValue(
                          'selectedDays',
                          watchSelectedDays.filter((d) => d !== day)
                        );
                      } else {
                        setValue('selectedDays', [...watchSelectedDays, day]);
                      }
                    }}
                    className={`day-btn ${
                      selected ? 'bg-indigo-600 text-white' : 'bg-white'
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
    </>
  );
}
