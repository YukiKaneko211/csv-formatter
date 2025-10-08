'use client';

import { useState, useMemo } from 'react';
import { StudentRecord, ClassRecord } from '@/app/page';

type EditTableStepProps = {
  studentData: StudentRecord[];
  classData: ClassRecord[];
  onBack: () => void;
};

export default function EditTableStep({
  studentData,
  classData,
  onBack,
}: EditTableStepProps) {
  const [students, setStudents] = useState<StudentRecord[]>(
    studentData.map(s => ({ ...s, startDate: '' }))
  );
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [nameFilter, setNameFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Get unique location courses
  const locationCourses = useMemo(() => {
    const courses = new Set(students.map(s => s.locationCourse));
    return Array.from(courses).sort();
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesName = !nameFilter || student.studentName.includes(nameFilter);
      const matchesCourse = !courseFilter || student.locationCourse === courseFilter;
      return matchesName && matchesCourse;
    });
  }, [students, nameFilter, courseFilter]);

  // Get selected location course
  const selectedLocationCourse = useMemo(() => {
    if (selectedRows.size === 0) return null;
    const firstSelectedIdx = Array.from(selectedRows)[0];
    return students[firstSelectedIdx]?.locationCourse || null;
  }, [selectedRows, students]);

  // Get classes for a location course
  const getClassesForCourse = (locationCourse: string) => {
    return classData.filter(c => c.locationCourse === locationCourse);
  };

  const handleSelectRow = (index: number) => {
    const student = students[index];
    
    if (selectedRows.size === 0) {
      setSelectedRows(new Set([index]));
    } else {
      const currentCourse = selectedLocationCourse;
      if (student.locationCourse === currentCourse) {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
        setSelectedRows(newSelected);
      }
    }
  };

  const handleSelectAll = () => {
    const filteredIndices = filteredStudents.map(fs => 
      students.findIndex(s => 
        s.studentName === fs.studentName && 
        s.locationCourse === fs.locationCourse &&
        s.lessonAllocationId === fs.lessonAllocationId
      )
    );

    if (selectedRows.size === 0) {
      // Select all from same course
      const firstCourse = filteredStudents[0]?.locationCourse;
      if (firstCourse) {
        const sameCourseIndices = filteredIndices.filter(idx => 
          students[idx].locationCourse === firstCourse
        );
        setSelectedRows(new Set(sameCourseIndices));
      }
    } else {
      // Check if any filtered student is selected
      const anySelectedInFilter = filteredIndices.some(idx => selectedRows.has(idx));
      
      if (anySelectedInFilter) {
        // Deselect all currently selected rows that are in the filtered list
        const newSelected = new Set(selectedRows);
        filteredIndices.forEach(idx => {
          if (newSelected.has(idx)) {
            newSelected.delete(idx);
          }
        });
        setSelectedRows(newSelected);
      } else {
        // Select all from same course as currently selected
        const currentCourse = selectedLocationCourse;
        const sameCourseIndices = filteredIndices.filter(idx => 
          students[idx].locationCourse === currentCourse
        );
        const newSelected = new Set(selectedRows);
        sameCourseIndices.forEach(idx => newSelected.add(idx));
        setSelectedRows(newSelected);
      }
    }
  };

  const handleClassChange = (index: number, className: string, classId: string) => {
    const indicesToUpdate = selectedRows.size > 0 && selectedRows.has(index)
      ? Array.from(selectedRows)
      : [index];

    const newStudents = [...students];
    indicesToUpdate.forEach(idx => {
      newStudents[idx] = {
        ...newStudents[idx],
        className,
        classId,
      };
    });
    setStudents(newStudents);
  };

  const handleDateChange = (index: number, date: string) => {
    const indicesToUpdate = selectedRows.size > 0 && selectedRows.has(index)
      ? Array.from(selectedRows)
      : [index];

    const newStudents = [...students];
    indicesToUpdate.forEach(idx => {
      newStudents[idx] = {
        ...newStudents[idx],
        startDate: date ? `${date}T14:00:00.000+0900` : '',
      };
    });
    setStudents(newStudents);
  };

  const handleExport = () => {
    const csvContent = [
      ['生徒名', 'Lesson Allocation', '拠点コース名', 'クラス', '開始日'],
      ...students.map(s => [
        s.studentName,
        s.lessonAllocationId,
        s.locationCourse,
        s.classId || '',
        s.startDate || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `class_members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        クラス配置の編集
      </h2>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            生徒名で検索
          </label>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="生徒名を入力..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            拠点コースでフィルター
          </label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全て表示</option>
            {locationCourses.map(course => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected course indicator */}
      {selectedLocationCourse && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            選択中の拠点コース: <strong>{selectedLocationCourse}</strong>
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={filteredStudents.length > 0 && filteredStudents.every(fs => {
                    const idx = students.findIndex(s => 
                      s.studentName === fs.studentName && 
                      s.locationCourse === fs.locationCourse &&
                      s.lessonAllocationId === fs.lessonAllocationId
                    );
                    return selectedRows.has(idx);
                  })}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                生徒名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                拠点コース
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Lesson Allocation ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                クラス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                開始日
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => {
              const index = students.findIndex(s => 
                s.studentName === student.studentName && 
                s.locationCourse === student.locationCourse &&
                s.lessonAllocationId === student.lessonAllocationId
              );
              const isSelected = selectedRows.has(index);
              const canSelect = selectedRows.size === 0 || 
                student.locationCourse === selectedLocationCourse;
              const classes = getClassesForCourse(student.locationCourse);

              return (
                <tr
                  key={index}
                  className={`${
                    isSelected ? 'bg-blue-50' : ''
                  } ${!canSelect && selectedRows.size > 0 ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(index)}
                      disabled={!canSelect && selectedRows.size > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.locationCourse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.lessonAllocationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={student.classId || ''}
                      onChange={(e) => {
                        const selectedClass = classes.find(c => c.classId === e.target.value);
                        if (selectedClass) {
                          handleClassChange(index, selectedClass.className, selectedClass.classId);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400"
                    >
                      <option value="">選択してください</option>
                      {classes.map(cls => (
                        <option key={cls.classId} value={cls.classId}>
                          {cls.className}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="date"
                      value={student.startDate ? student.startDate.split('T')[0] : ''}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          戻る
        </button>
        <button
          onClick={handleExport}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          CSVをエクスポート
        </button>
      </div>
    </div>
  );
}