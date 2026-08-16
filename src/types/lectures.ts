import { Pagination } from "./courses";

export interface Lecture {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  slidesUrl?: string | null;
  pdfUrl?: string | null;
  order: number;
  courseId: string;
  status?: "Pending" | "Completed" | "Locked";
  locked?: boolean;
  availableAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LecturesData {
  items: Lecture[];
  pagination: Pagination;
}

export interface LecturesResponse {
  message: string;
  status: number;
  lang: string;
  data: LecturesData;
}
