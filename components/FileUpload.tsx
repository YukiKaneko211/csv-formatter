'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import ProgressBar from './ProgressBar';

type FileUploadProps = {
  fileNumber: 1 | 2;
  step: number;
  onUpload: (data: any[]) => void;
  expectedColumns: string[];
};

export default function FileUpload({
  fileNumber,
  step,
  onUpload,
  expectedColumns,
}: FileUploadProps) {
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateColumns = (headers: string[]): boolean => {
    const normalizedHeaders = headers.map((h) => h.trim());
    return expectedColumns.every((col) => normalizedHeaders.includes(col));
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('不正なファイルです');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const headers = Object.keys(results.data[0] || {});

        if (!validateColumns(headers)) {
          setError('不正なファイルです');
          return;
        }

        // Map data to expected format
        const mappedData = results.data.map((row: any) => {
          if (fileNumber === 1) {
            return {
              studentName: row['生徒名']?.trim() || '',
              locationCourse: row['Location Course: 拠点コース']?.trim() || '',
              lessonAllocationId: row['授業の割当て: 授業の割当ID']?.trim() || '',
            };
          } else {
            return {
              locationCourse: row['拠点コース: 拠点コース']?.trim() || '',
              className: row['クラス: クラス']?.trim() || '',
              classId: row['クラス: ID']?.trim() || '',
            };
          }
        });

        setError('');
        onUpload(mappedData);
      },
      error: () => {
        setError('不正なファイルです');
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getTitle = () => {
    return fileNumber === 1
      ? '生徒名、拠点コース、授業の割当IDのファイルをアップロードしてください。'
      : '拠点コース、クラス、クラスIDのファイルをアップロードしてください。';
  };

  return (
    <div className="bg-white rounded-lg p-12 max-w-6xl mx-auto">
      <ProgressBar currentStep={step} />

      <div className="mt-12">
        <h2 className="text-xl mb-8">{getTitle()}</h2>

        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-md p-16 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#4379EE] bg-blue-50'
              : 'border-[#4379EE] bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-6">
            <svg width="60" height="60" viewBox="0 0 83 83" fill="none">
              <path
                d="M55.33 6.92H17.29V76.08H65.79V17.29L55.33 6.92Z"
                fill="#4379EE"
              />
              <path d="M17.29 76.08L55.33 6.92L65.79 17.29" fill="#4379EE" />
              <path
                d="M65.79 17.29H55.33V6.92L65.79 17.29Z"
                fill="#4379EE"
                opacity="0.5"
              />
              <path
                d="M27.67 38.04H55.33M27.67 48.5H55.33M27.67 58.96H45.48"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <p className="text-lg">
              ドラッグ&ドロップ、もしくはクリックしてファイルを選択
            </p>

            {error && (
              <p className="text-red-600 text-xl font-normal mt-4">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}