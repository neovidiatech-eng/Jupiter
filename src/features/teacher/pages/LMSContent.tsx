import React, { useState } from "react";
import { Video, Eye, Award, Crown, Gem, Shield } from "lucide-react";
import { useCourses } from "../../../hooks/useCourses";
import { useRanks } from "../../../hooks/useRanks";
import { useNavigate } from "react-router-dom";

const LMSContent: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRank, setSelectedRank] = useState("All Ranks");
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: ranksData, isLoading: ranksLoading } = useRanks();

  const rankIcons: Record<string, any> = {
    SILVER: Award,
    GOLD: Crown,
    PLATINUM: Gem,
    TITAN: Shield,
  };

  const ranks = React.useMemo(() => {
    const fetchedRanks =
      ranksData?.items?.map((rank: any) => ({
        label: rank.name,
        icon: rankIcons[rank.name.toUpperCase()] || Award,
        color: rank.color || "#2563eb",
      })) || [];

    return [
      { label: "All Ranks", icon: Award, color: "#2563eb" },
      ...fetchedRanks,
    ];
  }, [ranksData]);

  const courses = coursesData?.items || [];

  const handleViewLectures = (courseId: string) => {
    navigate(`/teacher-dashboard/courses/${courseId}/lectures`);
  };

  if (coursesLoading || ranksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto p-4 sm:p-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 font-['Inter'] tracking-tight">
          Learning Management System
        </h1>
        <p className="text-slate-400 font-medium">
          Upload and manage course materials and recordings
        </p>
      </header>

      {/* Ranks Filter */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
        {ranks.map((rank, index) => {
          const Icon = rank.icon;
          // conditions for last item centering per breakpoint
          const isLast = index === ranks.length - 1;
          const centerClasses = `
            ${isLast && ranks.length % 2 === 1 ? "col-span-2 justify-center" : ""}
            md:${isLast && ranks.length % 3 === 1 ? "col-span-3 justify-center" : ""}
            lg:${isLast && ranks.length % 5 === 1 ? "col-span-5 justify-center" : "col-span-1"}
          `;

          return (
            <button
              key={rank.label}
              onClick={() => setSelectedRank(rank.label)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 md:px-12 py-3.5 rounded-xl text-[10px] sm:text-sm md:text-lg font-bold transition-all ${
                rank.label === selectedRank
                  ? "bg-[#2563eb] text-white shadow-xl shadow-blue-500/25"
                  : "bg-white text-[#2563eb] border border-gray-100 hover:bg-blue-50/50 shadow-sm"
              } ${centerClasses}`}
            >
              <Icon size={25} className="flex-shrink-0" />
              <span className="ml-2">{rank.label}</span>
            </button>
          );
        })}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses
          .filter(
            (item) =>
              selectedRank === "All Ranks" ||
              item.rank?.name?.toLowerCase() === selectedRank.toLowerCase(),
          )
          .map((item) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-100/50 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Header/Icon Area */}
                <div className="h-48 bg-blue-50/50 flex items-center justify-center relative">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                    <Video size={32} />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600">
                      Course
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Rank</span>
                      <span className="text-slate-800 font-bold">
                        {item.rank?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-slate-400 font-bold">
                        {item.lectures?.length || 0} Lectures
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewLectures(item.id)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    <Eye size={18} />
                    View Lectures
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LMSContent;
