// src/api/examApi.ts

// Define the Exam type here as well, or import it if it's in a central types file
export interface Exam {
  id: string;
  title: string;
  description: string;
  sheetImage: string; // This will be a base64 string if uploaded, or a URL
  createdAt: Date | string; // Allow string for storage, convert to Date on retrieval
}

// --- Mock Data & Storage (using localStorage for persistence across refreshes) ---
const EXAMS_STORAGE_KEY = 'mockExamsDB';

const getStoredExams = (): Exam[] => {
  if (typeof window === 'undefined') return []; // Guard for SSR
  const stored = localStorage.getItem(EXAMS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored).map((exam: Exam) => ({
      ...exam,
      createdAt: new Date(exam.createdAt), // Ensure createdAt is a Date object
    }));
  }
  return [];
};

const saveStoredExams = (exams: Exam[]) => {
  if (typeof window === 'undefined') return; // Guard for SSR
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
};
// -----------------------------------------------------------------------------

// Simulate API delay
const apiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getExams = async (): Promise<Exam[]> => {
  await apiDelay(500); // Simulate network latency
  console.log("Mock API: Fetching exams");
  const exams = getStoredExams();
  return [...exams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first
};

export const createExam = async (newExamData: Omit<Exam, 'id' | 'createdAt'> & { sheetImage: string }): Promise<Exam> => {
  await apiDelay(700);
  console.log("Mock API: Creating exam", newExamData);
  const exams = getStoredExams();
  const examWithMeta: Exam = {
    ...newExamData,
    id: `exam_${Date.now().toString()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date(),
  };
  exams.push(examWithMeta);
  saveStoredExams(exams);
  return examWithMeta;
};

// For update, the Partial<Exam> allows sending only changed fields,
// but our mock will replace the whole object for simplicity.
// The `id` is in the path, `updatedExamData` is the body.
export const updateExam = async (examId: string, updatedExamData: Partial<Omit<Exam, 'id' | 'createdAt'>>): Promise<Exam> => {
  await apiDelay(700);
  console.log("Mock API: Updating exam", examId, updatedExamData);
  let exams = getStoredExams();
  const examIndex = exams.findIndex(exam => exam.id === examId);
  if (examIndex === -1) {
    throw new Error("Exam not found for update");
  }
  // Merge existing with new, keeping original ID and createdAt
  const updatedExam = { ...exams[examIndex], ...updatedExamData, id: examId, createdAt: exams[examIndex].createdAt };
  exams[examIndex] = updatedExam;
  saveStoredExams(exams);
  return updatedExam;
};

export const deleteExam = async (examId: string): Promise<{ success: boolean }> => {
  await apiDelay(700);
  console.log("Mock API: Deleting exam", examId);
  let exams = getStoredExams();
  const initialLength = exams.length;
  exams = exams.filter(exam => exam.id !== examId);
  if (exams.length === initialLength) {
    // throw new Error("Exam not found for deletion"); // Or just return success false
    return { success: false };
  }
  saveStoredExams(exams);
  return { success: true };
};