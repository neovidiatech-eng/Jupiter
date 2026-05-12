import {
  Calendar,
  Award,
  BookOpen,
  User,
  MessageSquare,
  ChevronRight,
  Star,
} from "lucide-react";
// Student Dashboard Page
import { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { studentDashboardRoutes } from "./studentDashboardRoutes";
import { useDashboardData } from "../../features/student/hooks/useDashboardData";
import { useCreateConversation } from "../../hooks/useMessages";

import { useLanguage } from "../../contexts/LanguageContext";
import TeacherFeedback from "../../features/student/components/Feedback";

export default function StudentDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const { data: dashboardResponse, isLoading: isDashboardLoading } = useDashboardData();
  const dashboardData = dashboardResponse?.data;
  const metadata = dashboardData?.metadata;
  const nextSession = dashboardData?.nextSchedule;

  const { mutate: startChat, isPending } = useCreateConversation();


  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!nextSession) {
      setTimeLeft(0);
      return;
    }
    const targetDate = new Date(nextSession.start_time);

    const updateTimer = () => {
      const now = new Date().getTime();
      const dist = targetDate.getTime() - now;
      setTimeLeft(Math.max(0, dist));
    };


    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [nextSession]);

  const countdown = useMemo(() => {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return {
      days: d.toString().padStart(2, '0'),
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0'),
      totalSeconds
    };
  }, [timeLeft]);

  const JOIN_THRESHOLD_SECONDS = 2 * 60;
  const isSessionReady = nextSession && countdown.totalSeconds <= JOIN_THRESHOLD_SECONDS;

  const renderStudentHome = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Main Welcome/Session Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2563eb] to-[#1e40af] p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20 group">
        {/* Background Decorative Circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-1000" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-1000" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <p className="text-blue-100 font-bold tracking-widest uppercase text-xs">
                {language === "ar" ? "تبدأ الحصة القادمة خلال" : "Next Session Starts In"}
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter flex items-baseline gap-2">
                {countdown.days !== "00" && (
                  <span className="flex items-baseline gap-1">
                    {countdown.days}
                    <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "يوم" : "d"}</span>
                  </span>
                )}
                <span className="flex items-baseline gap-1">
                  {countdown.hours}
                  <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "س" : "h"}</span>
                </span>
                <span className="flex items-baseline gap-1">
                  {countdown.minutes}
                  <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "د" : "m"}</span>
                </span>
                <span className="flex items-baseline gap-1">
                  {countdown.seconds}
                  <span className="text-xl opacity-60 font-bold uppercase">{language === "ar" ? "ث" : "s"}</span>
                </span>
              </h2>
            </div>

            <div className="space-y-4 pt-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {nextSession ? nextSession.title : (language === "ar" ? "لا توجد حصص قادمة" : "No upcoming sessions")}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-blue-100/80 font-medium">
                {nextSession && (
                  <>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <BookOpen size={16} />
                      <span className="text-sm">{nextSession?.course?.title || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <User size={16} />
                      <span className="text-sm">{nextSession?.teacher?.user?.name || "-"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6">
              <button
                disabled={!isSessionReady}
                className={`px-8 py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${isSessionReady
                  ? "bg-white text-blue-600 hover:bg-blue-50 hover:-translate-y-1"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
                  }`}
              >
                {isSessionReady ? "Join Now" : "Wait for Session"}
              </button>
              <button
                onClick={() => navigate('/student-dashboard/reschedule')}
                className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
              >
                <Calendar size={18} />
                Reschedule
              </button>
              <button
                onClick={() => {
                  if (nextSession) {
                    startChat(
                      {
                        teacherId: nextSession?.teacher?.id,
                        studentId: metadata?.id || "",
                      },
                      {
                        onSuccess: (data) => {
                          console.log("📝 Chat Data:", data);
                          console.log("👨‍🏫 Teacher Object:", nextSession?.teacher);
                          navigate("/student-dashboard/chat", {
                            state: {
                              conversationId: data.id,
                              teacherId: nextSession?.teacher?.id,
                              teacherUserId: nextSession?.teacher?.user?.id,
                              teacherName: nextSession?.teacher?.user?.name || "Instructor",
                              teacherSubject: nextSession?.course?.title || "General",
                              sessionTitle: nextSession?.title || "Not scheduled",
                              sessionTime: nextSession?.start_time,
                            },
                          });
                        },
                      }
                    );
                  }
                }}
                disabled={isPending || !nextSession}
                className={`flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all ${(!nextSession) ? "text-white/40 cursor-not-allowed" : "text-white/80 hover:text-white"
                  }`}
              >
                <MessageSquare size={18} />
                {isPending ? "Opening..." : "Message Instructor"}
              </button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-4">
            <div className="bg-white/10 border border-white/20 backdrop-blur-md px-6 py-2.5 rounded-full text-sm font-bold tracking-wide uppercase">
              Upcoming
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Subscription & Feedback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-8">
        <div className="lg:col-span-2 h-full">
          {/* Your Subscription Card */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4 mt-10">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  Your Subscription
                </h3>
                <p className="text-slate-400 font-bold text-xs tracking-wide">
                  {metadata?.plan?.name || "No Plan"}
                </p>
              </div>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Annual
              </span>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="space-y-2 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500">
                    Sessions Progress
                  </span>
                  <span className="text-xs font-black text-slate-800 tracking-tighter">
                    {metadata?.sessions_attended || 0} / {metadata?.sessions || 0}
                  </span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${((metadata?.sessions_attended || 0) / (metadata?.sessions || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 pb-0 mt-10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Sessions Remaining
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">
                    {metadata?.sessions_remaining || 0}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Price
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">
                    {metadata?.plan?.price}  {metadata?.plan?.currency?.symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 h-full">
          <TeacherFeedback
            rating={Number(dashboardData?.metadata?.user?.reviewsReceived?.[0]?.rating || 0)}
            message={dashboardData?.metadata?.user?.reviewsReceived?.[0]?.comment || ""}
          />
        </div>
      </div>

      {/* Learning Path Section - Aligned with Subscription (2/3 width) */}
      <div className="space-y-8 lg:w-2/3">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
            Learning Path
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Level Card - Enhanced & Enlarged */}
          <div
            className="group relative bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden"
            onClick={() => {
              const rank = metadata?.rank;
              if (rank) {
                navigate(`/student-dashboard/Materials/Levels`, {
                  state: { rank }
                });
              } else {
                navigate('/student-dashboard/Materials/Levels');
              }
            }}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[80px] -mr-6 -mt-6 transition-transform group-hover:scale-110 duration-700" />

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Award size={32} strokeWidth={1.5} />
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    Active Level
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">
                  {metadata?.rank?.name || 'No Rank'}
                </h4>
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen size={16} className="text-blue-400" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {metadata?.rank?.courses.length + ' ' + 'Curriculums Available'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-2/3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
                <span className="text-xs font-black text-slate-800">65%</span>
              </div>
            </div>
          </div>

          {/* Stats/Next Goal Card */}
          <div className="bg-slate-50/50 rounded-[32px] p-8 border border-dashed border-slate-200 flex flex-col justify-center items-center gap-4 text-center group hover:bg-white hover:border-solid hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors shadow-sm">
              <Star size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Next Milestone</p>
              <h5 className="text-lg font-bold text-slate-600 group-hover:text-slate-800 leading-tight">Keep learning to unlock the next rank!</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <StudentDashboardLayout>
        {isDashboardLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Routes>
            <Route index element={renderStudentHome()} />
            {studentDashboardRoutes.flatMap((route) => {
              if (route.subItems) {
                return route.subItems.map((subItem) => (
                  <Route
                    key={subItem.id}
                    path={subItem.path}
                    element={subItem.element}
                  />
                ));
              }
              return route.element
                ? [
                  <Route
                    key={route.id}
                    path={route.path}
                    element={route.element}
                  />,
                ]
                : [];
            })}
          </Routes>
        )}

      </StudentDashboardLayout>

    </>
  );
}
