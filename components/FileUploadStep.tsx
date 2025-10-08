'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { StudentRecord, ClassRecord } from '@/app/page';

type FileUploadStepProps = {
  fileNumber: 1 | 2;
  title: string;
  expectedHeaders: string[];
  onUpload: (data: any[]) => void;
  onBack: (() => void) | null;
};

export default function FileUploadStep({
  fileNumber,
  title,
  expectedHeaders,
  onUpload,
  onBack,
}: FileUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('CSV以外は受け付けません');
      setFile(null);
      setShowPreview(false);
      return;
    }

    setFile(selectedFile);
    setError('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        if (data.length === 0) {
          setError('不正なファイルです');
          return;
        }

        const fileHeaders = Object.keys(data[0]);
        setHeaders(fileHeaders);

        // Basic validation
        const isValidHeaders = expectedHeaders.every(expected => 
          fileHeaders.some(h => h.trim() === expected.trim())
        );

        if (!isValidHeaders) {
          setError('不正なファイルです');
          return;
        }

        setPreviewData(data.slice(0, 5));
        setShowPreview(true);
      },
      error: () => {
        setError('不正なファイルです');
      }
    });
  };

  const handleNext = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        if (fileNumber === 1) {
          const studentRecords: StudentRecord[] = data.map(row => ({
            studentName: row['生徒名']?.trim() || '',
            locationCourse: row['Location Course: 拠点コース']?.trim() || '',
            lessonAllocationId: row['授業の割当て: 授業の割当ID']?.trim() || '',
          }));
          onUpload(studentRecords);
        } else {
          const classRecords: ClassRecord[] = data.map(row => ({
            locationCourse: row['拠点コース: 拠点コース']?.trim() || '',
            className: row['クラス: クラス']?.trim() || '',
            classId: row['クラス: ID']?.trim() || '',
          }));
          onUpload(classRecords);
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>

      {!showPreview ? (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id={`file-upload-${fileNumber}`}
            />
            <label
              htmlFor={`file-upload-${fileNumber}`}
              className="cursor-pointer"
            >
              <div className="text-gray-600 mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-lg text-gray-700 mb-2">
                クリックしてファイルを選択
              </p>
              <p className="text-sm text-gray-500">CSV形式のみ</p>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              プレビュー（最初の5行）
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {headers.map((header, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowPreview(false);
                setFile(null);
                setPreviewData([]);
                setHeaders([]);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}