import { TeacherApi } from "../features/admin/services/TeacherAvailabilityServices";

export const mapTeachersToSessions = (teachers: TeacherApi[]) => {
  const sessions: any[] = [];

  teachers.forEach((teacher) => {
    if (!teacher.schedules || !Array.isArray(teacher.schedules)) return;

    teacher.schedules.forEach((s) => {
      if (!s.start_time) return;

      const rawStart = s.start_time.replace(" ", "T");
      const startDate = new Date(rawStart);
      if (isNaN(startDate.getTime())) return;

      let endDate = s.end_time ? new Date(s.end_time.replace(" ", "T")) : new Date(startDate.getTime() + 60 * 60 * 1000);
      if (isNaN(endDate.getTime()) || endDate.getTime() <= startDate.getTime()) {
        endDate = new Date(startDate.getTime() + (s.type?.toLowerCase() === "half" ? 30 : 60) * 60 * 1000);
      }

      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const day = String(startDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      sessions.push({
        id: s.id,
        sessionName: s.title || "Session",
        teacherId: teacher.id,
        teacherName: teacher.user?.name || "Teacher",
        studentName: s.student?.user?.name || s.studentName || s.studentId || s.title || "Student",
        subject: s.title || "General",
        date: dateStr,
        day: startDate.toLocaleDateString("en-US", { weekday: "long" }),
        time: startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        endTime: endDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });
    });
  });

  return sessions;
};
