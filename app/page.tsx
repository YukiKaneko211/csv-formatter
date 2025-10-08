'use client';

import { useState } from 'react';
import FileUploadStep from '@/components/FileUploadStep';
import EditTableStep from '@/components/EditTableStep';

export type StudentRecord = {
  studentName: string;
  locationCourse: string;
  lessonAllocationId: string;
  classId?: string;
  className?: string;
  startDate?: string;
};

export type ClassRecord = {
  locationCourse: string;
  className: string;
  classId: string;
};

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [studentData, setStudentData] = useState<StudentRecord[]>([]);
  const [classData, setClassData] = useState<ClassRecord[]>([]);

  const handleFile1Upload = (data: StudentRecord[]) => {
    setStudentData(data);
    setStep(2);
  };

  const handleFile2Upload = (data: ClassRecord[]) => {
    setClassData(data);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setStudentData([]);
    } else if (step === 3) {
      setStep(2);
      setClassData([]);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          クラスメンバーCSVアプリ
        </h1>

        {step === 1 && (
          <FileUploadStep
            fileNumber={1}
            title="入力ファイル1をアップロード"
            expectedHeaders={['生徒名', 'Location Course: 拠点コース', '授業の割当て: 授業の割当ID']}
            onUpload={handleFile1Upload}
            onBack={null}
          />
        )}

        {step === 2 && (
          <FileUploadStep
            fileNumber={2}
            title="入力ファイル2をアップロード"
            expectedHeaders={['拠点コース: 拠点コース', 'クラス: クラス', 'クラス: ID']}
            onUpload={handleFile2Upload}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <EditTableStep
            studentData={studentData}
            classData={classData}
            onBack={handleBack}
          />
        )}
      </div>
    </main>
  );
}