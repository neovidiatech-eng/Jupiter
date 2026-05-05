import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyRequests } from "../../../hooks/useMyRequests";

export default function RescheduleSession() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: requestsData, isLoading } = useMyRequests();

  const history = useMemo(() => {
    // 1. Safely extract the raw requests array from various possible structures
    let rawRequests: any[] = [];
    const dataObj = requestsData as any;
    if (dataObj) {
      if (Array.isArray(dataObj)) {
        rawRequests = dataObj;
      } else if (dataObj.data) {
        if (Array.isArray(dataObj.data)) {
          rawRequests = dataObj.data;
        } else if (dataObj.data.student_requests) {
          rawRequests = dataObj.data.student_requests;
        } else if (dataObj.data.requests) {
          rawRequests = dataObj.data.requests;
        }
      }
    }

    if (rawRequests.length === 0) return [];
    
    console.log("My Requests Raw Data:", rawRequests);

    return rawRequests
      .filter(req => req.type?.toLowerCase().includes('reschedule'))
      .map(req => {
        const requestedData = req.requestedData;
        const formatDate = (dateString: string) => {
          if (!dateString) return "N/A";
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          } catch(e) {
            return "Invalid Date";
          }
        };

        return {
          id: req.id,
          original: req.schedule?.start_time ? formatDate(req.schedule.start_time) : "N/A",
          new: requestedData?.new_start_time ? formatDate(requestedData.new_start_time) : 
               requestedData?.newStartTime ? formatDate(requestedData.newStartTime) : "N/A",
          reason: req.reason || "No reason provided",
          status: req.status ? (req.status.charAt(0).toUpperCase() + req.status.slice(1)) : "Pending",
        };
      });
  }, [requestsData]);

  // Calendar Logic
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const isPast = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Back Button */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/student-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          Reschedule Session
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Card */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-md">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">
              {monthName} {year}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-6">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-slate-400 font-bold text-sm py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty boxes for days of previous month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate === day;
              const disabled = isPast(day);
              
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    h-14 md:h-20 rounded-2xl flex flex-col items-center justify-center font-bold transition-all relative
                    ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 z-10"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                    ${disabled ? "opacity-20 cursor-not-allowed grayscale" : ""}
                  `}
                >
                  <span className="text-lg">{day}</span>
                  {isToday(day) && !isSelected && (
                    <div className="absolute bottom-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Times Card */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
            <CalendarIcon size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-800">
              Available Times
            </h4>
            <p className="text-slate-400 text-sm font-medium">
              Select a date to view available times
            </p>
          </div>
        </div>
      </div>

      {/* Reschedule History Table */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md overflow-hidden">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">
          Reschedule History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 font-bold text-sm border-b border-slate-200">
                <th className="pb-4 font-bold">Original Date</th>
                <th className="pb-4 font-bold">New Date</th>
                <th className="pb-4 font-bold">Reason</th>
                <th className="pb-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-medium">Loading history...</p>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">
                    No reschedule history found
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-6 font-bold text-slate-600">
                      {item.original}
                    </td>
                    <td className="py-6 font-bold text-slate-600">{item.new}</td>
                    <td className="py-6 text-slate-500 font-medium">
                      {item.reason}
                    </td>
                    <td className="py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        item.status.toLowerCase() === 'approved' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : item.status.toLowerCase() === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        <CheckCircle2 size={12} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
