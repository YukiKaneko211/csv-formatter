export type Student = {
  studentName: string;
  locationCourse: string;
  lessonAllocationId: string;
};

export type ClassInfo = {
  locationCourse: string;
  className: string;
  classId: string;
};

export type TableRow = Student & {
  selectedClass?: string;
  selectedClassId?: string;
  startDate?: string;
  isSelected?: boolean;
};