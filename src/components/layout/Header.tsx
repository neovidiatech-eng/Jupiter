import { Bell, LogOut, Menu, Play, Search, Plus } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { useSessions } from "../../contexts/SessionsContext";
import { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "../../features/student/hooks/useProfile";
import { useCreateSchedule } from "../../features/admin/hooks/useSchedules";
import { SessionFormData } from "../../lib/schemas/SessionSchema";
import AddSessionModal from "../modals/AddSessionModal";

interface HeaderProps {
  onMenuClick?: () => void;
  userRole: "admin" | "teacher" | "student";
  userName?: string;
  isCollapsed?: boolean;
}

// صغير reusable component
const TimeBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-sm md:text-xl font-black leading-none text-slate-800">
      {value}
    </span>
    <span className="text-[7px] md:text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
      {label}
    </span>
  </div>
);



export default function Header({
  onMenuClick,
  userRole,
  userName,
  isCollapsed,
}: HeaderProps) {
  useSettings();
  const { countdown, isSessionReady } = useSessions();

  const isStudent = userRole === "student";

  const { data: profileResponse } = useProfile({
    enabled: isStudent // Only fetch profile for students
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const createSchedule = useCreateSchedule();

  const handleAddSession = async (data: SessionFormData) => {
    try {
      await createSchedule.mutateAsync({
        studentId: data.student,
        teacherId: data.teacher,
        subject_id: data.subject,
        title: data.title,
        description: data.description || '',
        link: data.meetingLink || '',
        notes: data.notes || '',
        start_time: `${data.sessionDate}T${data.startTime}:00.000Z`,
        type: data.type,
        notification_Time: data.notification_Time
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Add session failed:', error);
    }
  };

  const profileData = profileResponse?.data;

  // تحسين الأداء بدل function عادية
  const marginClass = useMemo(() => {
    if (userRole === "student") return "";
    return isCollapsed ? "lg:ml-20" : "lg:ml-72";
  }, [userRole, isCollapsed]);

  const isTeacherOrStudent = userRole === "teacher" || isStudent;
  const navigate = useNavigate();
  const location = useLocation();
  const isSessionsPage = location.pathname.includes("/sessions");
  const isCurriculumPage = location.pathname.includes("/curriculum");

  const studentInfo = {
    name: profileData?.user?.name || "---",
    plan: profileData?.plan?.name_en || "Free Plan",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.user?.name || "U")}&background=random`,
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  return (
    <header
      className={`bg-white sticky top-0 z-40 transition-all duration-300 border-b border-gray-100 ${marginClass}`}
    >
      <div
        className={`flex flex-row items-center justify-between px-4 sm:px-8 h-[70px] md:h-[90px] gap-2 ${marginClass}`}
      >
        {/* 1. Left Side: Logo / Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {!isStudent && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div
            className="flex items-center relative hover:cursor-pointer"
            onClick={() => {
              const role = localStorage.getItem('role') || userRole;
              if (role === 'admin' || role === 'super_admin') navigate("/dashboard");
              else if (role === 'teacher') navigate("/teacher-dashboard");
              else if (role === 'student') navigate("/student-dashboard");
              else navigate("/");
            }}
          >
            {isStudent ? (
              <div className="flex flex-row items-center gap-2">
                <div className="flex items-center justify-center bg-[#2049BF] rounded-[10px] w-8 h-8 md:w-[39px] md:h-[39px]">
                  <span className="text-white text-lg md:text-xl font-bold">J</span>
                </div>
                <span className="text-black text-lg md:text-xl font-bold hidden xs:block">Jupiter</span>
              </div>
            ) : (
              <div className="lg:hidden flex items-center gap-2">
                 <div className="flex items-center justify-center bg-indigo-600 rounded-[10px] w-8 h-8">
                  <span className="text-white text-lg font-bold">J</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Middle Section: Dynamic Content */}
        <div className=" flex-1 flex items-center justify-center px-2 md:px-4 min-w-0">
          {isTeacherOrStudent && (
            <div className="flex items-center gap-2 md:gap-8 max-w-full">
              <div className="flex items-center gap-2 md:gap-4 bg-slate-50/80 px-3 md:px-6 py-1.5 md:py-3 rounded-full md:rounded-[20px] border border-slate-100">
                <span className="hidden lg:inline-block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Next Session:
                </span>
                <div className="hidden lg:flex gap-2 md:gap-6 items-center scale-90 md:scale-100">
                  <TimeBox value={countdown.days} label="D" />
                  <Separator />
                  <TimeBox value={countdown.hours} label="H" />
                  <Separator />
                  <TimeBox value={countdown.minutes} label="M" />
                </div>
              </div>

              <button
                disabled={!isSessionReady}
                className={`flex items-center gap-2 px-3 md:px-8 py-2 md:py-3.5 rounded-full md:rounded-2xl text-[10px] md:text-sm font-bold whitespace-nowrap transition-all ${
                  isSessionReady
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                    : "bg-[#f1f5f9] text-slate-400 cursor-not-allowed"
                }`}
              >
                <Play size={14} className="md:w-4 md:h-4" fill="currentColor" />
                <span className="hidden xs:inline">{isSessionReady ? "Join Now" : "Join Session"}</span>
                <span className="xs:hidden">{isSessionReady ? "Go" : "Live"}</span>
              </button>
            </div>
          )}

          {!isTeacherOrStudent && (
            <div className="flex w-full items-center">
              {isSessionsPage || isCurriculumPage ? (
                <div className="hidden sm:flex items-center gap-4 md:gap-8 h-full">
                  <button className="text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 py-2">Overview</button>
                  <button className="text-sm font-bold text-[#6366f1] border-b-2 border-[#6366f1] py-2">Batch List</button>
                  <button className="text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 py-2">Conflicts</button>
                </div>
              ) : (
                <div className="flex w-full items-center gap-4 md:gap-12 max-w-2xl">
                  {/* Search Bar - Hidden on mobile, or replaced by icon */}
                  <div className="relative w-full hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                  
                  {/* Search Icon for mobile */}
                  <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600">
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Navigation Links */}
                  <div className="hidden xl:flex items-center gap-8 shrink-0">
                    <a href="#" className="text-sm font-bold text-gray-900">Directory</a>
                    <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Reports</a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Right Side: Profile / Actions */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          {isTeacherOrStudent && (
            <div className="flex items-center gap-2 md:gap-4">
              <DesktopProfile 
                navigate={navigate} 
                studentName={studentInfo.name} 
                studentPlan={studentInfo.plan} 
                studentAvatar={studentInfo.avatar} 
                compact={true}
              />
              {isStudent && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          )}

          {!isTeacherOrStudent && (
            <div className="flex items-center gap-3 md:gap-6">
              {!isSessionsPage && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#5e5ce6] text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} /> Create
                </button>
              )}
              
              <div className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                <Bell className="w-5 h-5" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex items-center gap-2 cursor-pointer md:pl-4 md:border-l border-gray-100 group">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-gray-900 leading-none group-hover:text-indigo-600 transition-colors">{userName || 'User'}</p>
                  <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">{userRole}</p>
                </div>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'U')}&background=1e1b4b&color=fff`} 
                  alt="User" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-100 transition-all" 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AddSessionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSession}
      />
    </header>
  );
}

const Separator = () => (
  <span className="text-slate-300 font-bold text-xs md:text-lg mb-1 md:mb-4">
    :
  </span>
);


const DesktopProfile = ({
  className = "",
  navigate,
  studentName,
  studentPlan,
  studentAvatar,
  compact = false,
}: {
  className?: string;
  navigate: any;
  studentName: string;
  studentPlan: string;
  studentAvatar: string;
  compact?: boolean;
}) => (
  <div className={`flex items-center gap-2 md:gap-4 ${className}`}>
    {!compact && (
      <button className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-2xl text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-all border border-slate-100 relative">
        <Bell size={18} className="md:w-5 md:h-5" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white" />
      </button>
    )}

    <div
      className="flex items-center gap-2 md:gap-3 hover:cursor-pointer hover:bg-gray-50 rounded-xl p-1 md:p-1.5 transition-all"
      onClick={() => navigate("/student-dashboard/profile")}
    >
      <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
         <img
                src={studentAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-xs md:text-sm font-bold text-slate-800 leading-none">
          {studentName}
        </p>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
          {studentPlan}
        </p>
      </div>
    </div>
  </div>
);
