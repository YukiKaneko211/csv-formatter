'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';
import DataTable from '@/components/DataTable';

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

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [file1Data, setFile1Data] = useState<Student[]>([]);
  const [file2Data, setFile2Data] = useState<ClassInfo[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);

  const handleFile1Upload = (data: Student[]) => {
    setFile1Data(data);
    setStep(1.5);
  };

  const handleFile1Next = () => {
    setStep(2);
  };

  const handleFile1Back = () => {
    setStep(1);
  };

  const handleFile2Upload = (data: ClassInfo[]) => {
    setFile2Data(data);
    setStep(2.5);
  };

  const handleFile2Next = () => {
    const initialTableData: TableRow[] = file1Data.map((student) => ({
      ...student,
      isSelected: false,
    }));
    setTableData(initialTableData);
    setStep(3);
  };

  const handleFile2Back = () => {
    setStep(2);
  };

  return (
    <main className="min-h-screen min-w-max bg-[#EBF1FF]">
      {/* Header */}
      <header className="bg-[#EBF1FF] shadow-md h-24 flex items-center px-8">
        <h1 className="text-[#4379EE] text-3xl font-bold">
          クラス配置CSV作成くん
        </h1>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        {step === 1 && (
          <FileUpload
            fileNumber={1}
            step={1}
            onUpload={handleFile1Upload}
            expectedColumns={['生徒名', 'Location Course: 拠点コース', '授業の割当て: 授業の割当ID']}
          />
        )}
        {step === 1.5 && (
          <FilePreview
            fileNumber={1}
            step={1.5}
            data={file1Data.slice(0, 5)}
            columns={['生徒名', '拠点コース', '授業の割当ID']}
            onNext={handleFile1Next}
            onBack={handleFile1Back}
          />
        )}
        {step === 2 && (
          <FileUpload
            fileNumber={2}
            step={2}
            onUpload={handleFile2Upload}
            expectedColumns={['拠点コース: 拠点コース', 'クラス: クラス', 'クラス: ID']}
          />
        )}
        {step === 2.5 && (
          <FilePreview
            fileNumber={2}
            step={2.5}
            data={file2Data.slice(0, 5)}
            columns={['拠点コース', 'クラス', 'クラスID']}
            onNext={handleFile2Next}
            onBack={handleFile2Back}
          />
        )}
        {step === 3 && (
          <DataTable
            tableData={tableData}
            setTableData={setTableData}
            classData={file2Data}
          />
        )}
      </div>
    </main>
  );
}