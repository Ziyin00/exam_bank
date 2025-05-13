// src/types/course.ts
export interface CourseLink {
  title: string;
  url: string; // Or 'link' if your backend expects that for section links
}

export interface CourseSection {
  section: string;
  description: string;
  links: CourseLink[];
}

export interface CourseFormData {
  title: string;
  description: string;
  categoryId: number | string; // string for initial empty value
  departmentId: number | string; // string for initial empty value
  tag: string; // Will be mapped to course_tag for backend
  imageFile: File | null;
  benefit1: string;
  benefit2?: string;
  prerequisite1: string;
  prerequisite2?: string;
  year: number | string; // Expected by backend
  // General course links (if your addCourse 'links' field is for this)
  // For now, we'll assume the backend 'links' field is separate
  // and might be an empty array if not explicitly collected.
  // generalLinks?: Array<{ link_name: string; link: string }>; 
  courseContent: CourseSection[];
}



// src/types/course.ts
export interface CourseFormData {
  title: string;
  tag: string;
  description: string;
}

// Represents a course after it's saved (e.g., with an ID from the database)
export interface Course extends CourseFormData {
  id: string | number; // Or whatever type your DB uses for IDs
}