// types/course.d.ts
export interface CourseSection {
    section: string;
    description: string;
    links: Array<{ title: string; url: string }>;
  }
  
  export interface CourseFormData {
    title: string;
    description: string;
    categoryId: number;
    departmentId: number;
    tag: string;
    benefit1: string;
    benefit2: string;
    prerequisite1: string;
    prerequisite2: string;
    imageFile?: File;
    courseContent: CourseSection[];
  }