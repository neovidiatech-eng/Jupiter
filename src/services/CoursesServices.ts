import api from "../lib/axios";
import { CoursesData, Course, CoursesResponse, CourseResponse } from "../types/courses";

export const getAllCourses = async (): Promise<CoursesData> => {
   const response = await api.get<CoursesResponse>("/materials/courses");
   return response.data.data;
}


export const getCourseById = async (id: string): Promise<Course> => {
    const response = await api.get<CourseResponse>(`/materials/courses/${id}`);
    return response.data.data;
}

export const createCourse = async (data: any): Promise<Course> => {
    const response = await api.post<CourseResponse>(`/materials/courses`, data);
    return response.data.data;
}

export const updateCourse = async (id: string, data: any): Promise<Course> => {
    const response = await api.patch<CourseResponse>(`/materials/courses/${id}`, data);
    return response.data.data;
}

export const deleteCourse = async (id: string): Promise<void> => {
    await api.delete(`/materials/courses/${id}`);
}