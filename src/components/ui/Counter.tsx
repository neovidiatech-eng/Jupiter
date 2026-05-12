import { useEffect, useMemo, useState } from "react";
import { Video } from "lucide-react";
import { useJoinSession, useUserSessions } from "../../hooks/useSessions";
import { Schedule } from "../../types/scheduales";
import { useLanguage } from "../../contexts/LanguageContext";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function MiniHeaderTimer() {
  const { language } = useLanguage();
  const { data, isLoading } = useUserSessions("");
  const { mutateAsync: joinSession } = useJoinSession();

  const [timeLeft, setTimeLeft] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get nearest upcoming session
  const nextSession = useMemo<Schedule | null>(() => {
    if (!data?.data) return null;

    // data.data could be an array or an object with schedule categories
    const sessions: Schedule[] = Array.isArray(data.data)
      ? data.data
      : [
          ...((data.data as any).upcomingSchedule || []),
          ...((data.data as any).toDaySchedule || []),
          ...((data.data as any).previousSchedule || []),
        ];

    if (!sessions.length) return null;

    const now = new Date();

    const upcomingSessions = sessions
      .filter(
        (session: Schedule) =>
          new Date(session.start_time).getTime() > now.getTime()
      )
      .sort(
        (a: Schedule, b: Schedule) =>
          new Date(a.start_time).getTime() -
          new Date(b.start_time).getTime()
      );

    return upcomingSessions[0] || null;
  }, [data, refreshTrigger]);

  useEffect(() => {
    if (!nextSession) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const sessionTime = new Date(nextSession.start_time).getTime();
      const distance = sessionTime - now;

      if (distance <= 0) {
        setRefreshTrigger(prev => prev + 1);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSession]);

  const totalSecondsLeft = useMemo(() => {
    if (!nextSession) return 0;
    const now = new Date().getTime();
    const sessionTime = new Date(nextSession.start_time).getTime();
    return Math.max(0, Math.floor((sessionTime - now) / 1000));
  }, [nextSession, timeLeft.seconds]);

  const isReady = totalSecondsLeft > 0 && totalSecondsLeft <= 120; // 2 minutes

  const handleJoinSession = async () => {
    if (!nextSession?.id || !nextSession?.link) return;
    try {
      await joinSession(nextSession.id);
      window.open(nextSession.link, "_blank", "noopener,noreferrer");
    } catch (error) {
      // Error is handled by global interceptor
    }
  };

  if (!nextSession || isLoading) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Container Box */}
      <div className="flex items-center gap-6 bg-[#F3F4F6] border border-gray-100 rounded-[14px] px-5 py-2">
        {/* Next Session Label */}
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
          {language === "ar" ? "الحصة القادمة:" : "Next Session:"}
        </span>

        {/* Timer Units */}
        <div className="flex items-center gap-3">
          <TimeBlock 
            value={timeLeft.days} 
            label={language === "ar" ? "أيام" : "Days"} 
          />
          <span className="text-gray-300 font-bold -mt-3">:</span>
          <TimeBlock 
            value={timeLeft.hours} 
            label={language === "ar" ? "ساعات" : "Hours"} 
          />
          <span className="text-gray-300 font-bold -mt-3">:</span>
          <TimeBlock 
            value={timeLeft.minutes} 
            label={language === "ar" ? "دقائق" : "Min"} 
          />
        </div>
      </div>

      {/* Join Button */}
      <button
        onClick={handleJoinSession}
        disabled={!isReady}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-sm font-bold transition-all duration-300 active:scale-95 ${
          isReady 
            ? "bg-[#2049BF] text-white shadow-lg shadow-blue-100" 
            : "bg-[#E5E7EB] text-gray-400 cursor-not-allowed border border-gray-200"
        }`}
      >
        <Video size={18} className={isReady ? "text-white" : "text-gray-300"} />
        <span>{language === "ar" ? "انضم للحصة" : "Join Session"}</span>
      </button>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className="text-[15px] font-black text-gray-800 tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
        {label}
      </span>
    </div>
  );
}