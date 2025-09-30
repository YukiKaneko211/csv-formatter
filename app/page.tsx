'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Download, Calendar, Check, X } from 'lucide-react';

interface Student {
  studentName: string;
  locationCourse: string;
  lessonAllocationId: string;
  selectedClass?: string;
  selectedClassId?: string;
  startDate?: string;
}

interface ClassInfo {
  locationCourse: string;
  className: string;
  classId: string;
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [file1Uploaded, setFile1Uploaded] = useState(false);
  const [file2Uploaded, setFile2Uploaded] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedLocationCourseFilter, setSelectedLocationCourseFilter] = useState<string>('');

  const handleFile1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('CSVファイルのみ受け付けます');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        // Validate headers
        const headers = results.meta.fields || [];
        const requiredHeaders = ['生徒名', 'Location Course: 拠点コース', '授業の割当て: 授業の割当ID'];
        const hasValidHeaders = requiredHeaders.every(h => headers.includes(h));

        if (!hasValidHeaders) {
          setError('入力ファイル1のヘッダーが正しくありません');
          return;
        }

        const studentData: Student[] = data.map(row => ({
          studentName: row['生徒名'] || '',
          locationCourse: row['Location Course: 拠点コース'] || '',
          lessonAllocationId: row['授業の割当て: 授業の割当ID'] || '',
        }));

        setStudents(studentData);
        setFile1Uploaded(true);
        setError('');
      },
      error: () => {
        setError('ファイルの読み込みに失敗しました');
      }
    });
  };

  const handleFile2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('CSVファイルのみ受け付けます');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        // Validate headers
        const headers = results.meta.fields || [];
        const requiredHeaders = ['拠点コース: 拠点コース', 'クラス: クラス', 'クラス: ID'];
        const hasValidHeaders = requiredHeaders.every(h => headers.includes(h));

        if (!hasValidHeaders) {
          setError('入力ファイル2のヘッダーが正しくありません');
          return;
        }

        const classData: ClassInfo[] = data.map(row => ({
          locationCourse: row['拠点コース: 拠点コース'] || '',
          className: row['クラス: クラス'] || '',
          classId: row['クラス: ID'] || '',
        }));

        setClassInfo(classData);
        setFile2Uploaded(true);
        setError('');
      },
      error: () => {
        setError('ファイルの読み込みに失敗しました');
      }
    });
  };

  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      // Check if we can select this row (same location course as others)
      if (newSelected.size > 0) {
        const firstSelectedIndex = Array.from(newSelected)[0];
        const firstLocationCourse = students[firstSelectedIndex].locationCourse;
        const currentLocationCourse = students[index].locationCourse;
        
        if (firstLocationCourse !== currentLocationCourse) {
          setError('異なる拠点コースの生徒は同時に選択できません');
          return;
        }
      }
      newSelected.add(index);
      setError('');
    }
    
    setSelectedRows(newSelected);
  };

  const handleBulkClassSelect = (className: string) => {
    if (selectedRows.size === 0) return;

    const firstSelectedIndex = Array.from(selectedRows)[0];
    const locationCourse = students[firstSelectedIndex].locationCourse;
    
    const classData = classInfo.find(
      c => c.locationCourse === locationCourse && c.className === className
    );

    if (!classData) return;

    const updatedStudents = [...students];
    selectedRows.forEach(index => {
      updatedStudents[index] = {
        ...updatedStudents[index],
        selectedClass: className,
        selectedClassId: classData.classId,
      };
    });

    setStudents(updatedStudents);
  };

  const handleBulkDateSelect = (date: string) => {
    if (selectedRows.size === 0 || !date) return;

    const formattedDate = `${date}T14:00:00.000+0900`;
    const updatedStudents = [...students];
    
    selectedRows.forEach(index => {
      updatedStudents[index] = {
        ...updatedStudents[index],
        startDate: formattedDate,
      };
    });

    setStudents(updatedStudents);
  };

  const getAvailableClasses = (locationCourse: string): string[] => {
    return classInfo
      .filter(c => c.locationCourse === locationCourse)
      .map(c => c.className);
  };

  const handleExport = () => {
    const exportData = students
      .filter(s => s.selectedClass && s.selectedClassId && s.startDate)
      .map(s => ({
        '生徒名': s.studentName,
        'Lesson Allocation': s.lessonAllocationId,
        '拠点コース名': s.locationCourse,
        'クラス': s.selectedClassId,
        '開始日': s.startDate,
      }));

    if (exportData.length === 0) {
      setError('エクスポートするデータがありません');
      return;
    }

    const csv = Papa.unparse(exportData);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'class_assignment_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectedLocationCourse = (): string | null => {
    if (selectedRows.size === 0) return null;
    const firstSelectedIndex = Array.from(selectedRows)[0];
    return students[firstSelectedIndex].locationCourse;
  };

  const getUniqueLocationCourses = (): string[] => {
    const courses = new Set(students.map(s => s.locationCourse));
    return Array.from(courses).sort();
  };

  const handleSelectByLocationCourse = (locationCourse: string) => {
    const newSelected = new Set<number>();
    students.forEach((student, index) => {
      if (student.locationCourse === locationCourse) {
        newSelected.add(index);
      }
    });
    setSelectedRows(newSelected);
    setError('');
  };

  const handleDeselectAll = () => {
    setSelectedRows(new Set());
    setSelectedLocationCourseFilter('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          CSV Formatter - クラス配置ツール
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* File Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload size={20} />
              入力ファイル1（生徒情報）
            </h2>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFile1Upload}
                className="hidden"
              />
              <div className="text-center">
                {file1Uploaded ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={20} />
                    <span>アップロード済み</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">クリックしてCSVをアップロード</p>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload size={20} />
              入力ファイル2（クラス情報）
            </h2>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFile2Upload}
                className="hidden"
              />
              <div className="text-center">
                {file2Uploaded ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={20} />
                    <span>アップロード済み</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">クリックしてCSVをアップロード</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {file1Uploaded && file2Uploaded && students.length > 0 && (
          <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-900 text-lg">
              生徒の選択
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  拠点コースで選択
                </label>
                <select
                  value={selectedLocationCourseFilter}
                  onChange={(e) => setSelectedLocationCourseFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">拠点コースを選択...</option>
                  {getUniqueLocationCourses().map((course, idx) => (
                    <option key={idx} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => handleSelectByLocationCourse(selectedLocationCourseFilter)}
                  disabled={!selectedLocationCourseFilter}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  このコースを一括選択
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  全選択解除
                </button>
              </div>
            </div>
          </div>
        )}

        {file1Uploaded && file2Uploaded && selectedRows.size > 0 && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
            <h3 className="font-semibold mb-4 text-blue-900">
              一括操作（{selectedRows.size}件選択中）
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  クラスを選択
                </label>
                <select
                  onChange={(e) => handleBulkClassSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>クラスを選択...</option>
                  {getAvailableClasses(getSelectedLocationCourse() || '').map((className, idx) => (
                    <option key={idx} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  開始日を選択
                </label>
                <input
                  type="date"
                  onChange={(e) => handleBulkDateSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Student Table */}
        {file1Uploaded && students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">選択</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">生徒名</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">拠点コース</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lesson Allocation ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">クラス</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">開始日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedRows.has(index) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleRowSelect(index)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.locationCourse}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student.lessonAllocationId}</td>
                      <td className="px-4 py-3 text-sm">
                        {student.selectedClass ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {student.selectedClass}
                          </span>
                        ) : (
                          <span className="text-gray-400">未設定</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.startDate ? (
                          <span className="text-gray-900">{student.startDate.split('T')[0]}</span>
                        ) : (
                          <span className="text-gray-400">未設定</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Export Button */}
        {file1Uploaded && file2Uploaded && students.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Download size={20} />
              CSVをエクスポート
            </button>
          </div>
        )}
      </div>
    </main>
  );
}