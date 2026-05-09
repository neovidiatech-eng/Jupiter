import {
  Calendar,
  Award,
  Play,
  BookOpen,
  User,
  MessageSquare,
  Lock,
  ChevronRight,
} from "lucide-react";
// Student Dashboard Page
import { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import SubscribePlanModal from "../../components/modals/SubscribePlanModal";
import StudentDashboardLayout from "./StudentDashboardLayout";
import { studentDashboardRoutes } from "./studentDashboardRoutes";
import { useDashboardData } from "../../features/student/hooks/useDashboardData";
import { useCreateConversation } from "../../hooks/useMessages";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

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
                Next Session Starts In
              </p>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
                {countdown.hours}:{countdown.minutes}:{countdown.seconds}
              </h2>
            </div>

            <div className="space-y-4 pt-4">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {nextSession ? nextSession.title : "No upcoming sessions"}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-blue-100/80 font-medium">
                {nextSession && (
                  <>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <BookOpen size={16} />
                      <span className="text-sm">{nextSession?.subject?.name || "-"}</span>
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
                              teacherSubject: nextSession?.subject?.name || "General",
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

      {/* 2. Subscription & Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Subscription Card */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                Your Subscription
              </h3>
              <p className="text-slate-400 font-bold text-sm tracking-wide">
                {metadata?.plan?.name || "No Plan"}
              </p>
            </div>
            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              Annual
            </span>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-500">
                  Sessions Progress
                </span>
                <span className="text-sm font-black text-slate-800 tracking-tighter">
                  {metadata?.sessions_attended || 0} / {metadata?.sessions || 0}
                </span>
              </div>
              <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((metadata?.sessions_attended || 0) / (metadata?.sessions || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 pb-0">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Sessions Remaining
                </p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">
                  {metadata?.sessions_remaining || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Price
                </p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">
                  {metadata?.plan?.price}  {metadata?.plan?.currency?.symbol}
                </p>
              </div>
            </div>

         
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-8">
            Quick Stats
          </h3>
          <div className="space-y-6">
            {[
              {
                label: "Videos Watched",
                value: `${metadata?.sessions_attended || 0} / ${metadata?.sessions || 0}`,
                icon: Play,
                color: "bg-blue-50 text-blue-500",
              },
              {
                label: "Current Level",
                value: `${metadata?.rank.name||`Silver`}`,
                icon: Award,
                color: "bg-amber-50 text-amber-500",
              },
              {
                label: "Joined On",
                value: metadata?.joindate ? new Date(metadata.joindate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Aug 2025",
                icon: Calendar,
                color: "bg-emerald-50 text-emerald-500",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-2 group cursor-default"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm`}
                >
                  <stat.icon size={24} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-slate-800 tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Learning Path Timeline */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            Learning Path
          </h3>
          <button
            onClick={() => navigate('/student-dashboard/recorded-videos')}
            className="flex items-center gap-2 bg-slate-50 text-slate-600 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all"
          >
            <Play size={16} className="fill-current" />
            View All Videos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Active Level Card */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all cursor-pointer group relative overflow-hidden" onClick={() => navigate('/student-dashboard/Materials/Levels')}>
            <div className="absolute top-0 right-0 p-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <ChevronRight size={18} strokeWidth={3} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 relative shadow-inner">
                <Award size={32} />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
                  2
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                  Silver Level
                </h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  4 Curriculums
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Progress
                  </span>
                  <span className="text-[11px] font-black text-blue-600">
                    45%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <div className="h-full bg-blue-600 rounded-full w-[45%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Locked Level Cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100/50 flex flex-col items-center justify-center gap-6 group cursor-not-allowed grayscale"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm opacity-60">
                <Lock size={32} />
              </div>
              <div className="text-center space-y-1 opacity-40">
                <h4 className="text-xl font-bold text-slate-400 tracking-tight">
                  Locked
                </h4>
              </div>
            </div>
          ))}
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
      <SubscribePlanModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />
    </>
  );
}
