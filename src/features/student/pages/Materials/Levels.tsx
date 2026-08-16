import { ArrowLeft, Award } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CurriculumCard from "../../components/CurriculumCard";
import { useCourses } from "../../../../hooks/useCourses";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useQuery } from "@tanstack/react-query";
import { getStudentProgress } from "../../../../services/CoursesServices";

function CourseCardWithProgress({ course, index, navigate }: any) {
  const { data: progressData } = useQuery({
    queryKey: ["student-progress", course.id],
    queryFn: async () => {
      // Stagger requests to avoid backend rate limiting
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, index * 200));
      }
      return getStudentProgress(course.id);
    },
    enabled: !!course.id,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes to reduce refetches
  });

  const lectures = progressData?.lectures || [];
  const totalSessions = Math.max(lectures.length, 1);
  const completedSessions = lectures.filter((l: any) => {
    const isLocked = l.locked || l.status?.toLowerCase() === "locked";
    return !isLocked && l.status?.toLowerCase() === "completed";
  }).length;

  return (
    <CurriculumCard
      id={index + 1}
      title={course.title || "Untitled Course"}
      description={course.description || "Course details"}
      totalSessions={lectures.length > 0 ? lectures.length : 1}
      completedSessions={completedSessions}
      currentSession={completedSessions + 1}
      startSessionNumber={1}
      status={completedSessions > 0 && completedSessions === lectures.length ? "Completed" : "In Progress"}
      onClick={() =>
        navigate(`/student-dashboard/Materials/Levels/${course.id}`, {
          state: { courseTitle: course.title },
        })
      }
    />
  );
}

export default function Levels() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateRank = location.state?.rank;

  const { data: dashboardResponse } = useDashboardData();
  const rank = stateRank || dashboardResponse?.data?.metadata?.rank;

  const rankName = rank?.name || "Levels";
  
  const { data: coursesData, isLoading } = useCourses(1, 100, rank?.id);
  const courses = coursesData?.items || rank?.courses || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-6 md:p-10 max-w-7xl mx-auto">
      {/* Top Back Nav */}
      <div>
        <button
          onClick={() => navigate("/student-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Award className="w-12 h-12 text-blue-500 fill-blue-100" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{rankName} Level</h1>
            <p className="text-slate-500 font-medium mt-1">
              {courses.length} Courses
            </p>
          </div>
        </div>

        {/* Global Progress Bar (Hidden for courses view as we don't have cumulative progress here yet) */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full w-0"></div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            Loading courses...
          </div>
        ) : (
          <>
            {courses.map((course: any, index: number) => (
              <CourseCardWithProgress
                key={course.id || index}
                course={course}
                index={index}
                navigate={navigate}
              />
            ))}

            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                No courses found in this level.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
