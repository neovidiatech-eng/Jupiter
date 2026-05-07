export interface TeacherStudentSubject {
    code: string;
}

export interface TeacherStudent {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    subject: TeacherStudentSubject;
    sessions: string;
}

export interface TeacherStudentsResponse {
    message: string;
    status: number;
    lang: string;
    data: TeacherStudent[];
}
