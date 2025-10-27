'use client';

import { useState, useMemo } from 'react';
import ProgressBar from './ProgressBar';
import type { TableRow, ClassInfo } from '@/app/page';

type DataTableProps = {
  tableData: TableRow[];
  setTableData: (data: TableRow[]) => void;
  classData: ClassInfo[];
};

export default function DataTable({
  tableData,
  setTableData,
  classData,
}: DataTableProps) {
  const [studentFilter, setStudentFilter] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Get unique students and courses for filters
  const uniqueStudents = useMemo(
    () => Array.from(new Set(tableData.map((row) => row.studentName))),
    [tableData]
  );

  const uniqueCourses = useMemo(
    () => Array.from(new Set(tableData.map((row) => row.locationCourse))),
    [tableData]
  );

  // Filter table data
  const filteredData = tableData.filter((row) => {
    const matchStudent = !studentFilter || row.studentName === studentFilter;
    const matchCourse = !courseFilter || row.locationCourse === courseFilter;
    return matchStudent && matchCourse;
  });

  // Get available classes for a specific location course
  const getClassesForCourse = (locationCourse: string) => {
    return classData.filter((c) => c.locationCourse === locationCourse);
  };

  // Handle select/deselect all filtered view (header checkbox)
  const handleSelectAllFiltered = () => {
    const allFilteredSelected = filteredData.every((row) => row.isSelected);
    setTableData(
      tableData.map((row) => {
        // Only affect rows that match current filters
        if (
          (!studentFilter || row.studentName === studentFilter) &&
          (!courseFilter || row.locationCourse === courseFilter)
        ) {
          return { ...row, isSelected: !allFilteredSelected };
        }
        return row;
      })
    );
  };

  // Handle select/deselect all (button - affects ALL rows regardless of filters)
  const handleToggleAllRows = () => {
    const anySelected = tableData.some((row) => row.isSelected);
    setTableData(
      tableData.map((row) => ({
        ...row,
        isSelected: !anySelected,
      }))
    );
  };

  // Handle individual row selection
  const handleRowSelect = (index: number) => {
    const actualIndex = tableData.findIndex(
      (row) =>
        row.studentName === filteredData[index].studentName &&
        row.locationCourse === filteredData[index].locationCourse &&
        row.lessonAllocationId === filteredData[index].lessonAllocationId
    );

    const newData = [...tableData];
    newData[actualIndex].isSelected = !newData[actualIndex].isSelected;
    setTableData(newData);
  };

  // Handle class selection
  const handleClassChange = (index: number, classId: string) => {
    const actualIndex = tableData.findIndex(
      (row) =>
        row.studentName === filteredData[index].studentName &&
        row.locationCourse === filteredData[index].locationCourse &&
        row.lessonAllocationId === filteredData[index].lessonAllocationId
    );

    const selectedClass = classData.find((c) => c.classId === classId);
    const newData = [...tableData];
    newData[actualIndex].selectedClassId = classId;
    newData[actualIndex].selectedClass = selectedClass?.className;
    setTableData(newData);
  };

  // Handle date change
  const handleDateChange = (index: number, date: string) => {
    const actualIndex = tableData.findIndex(
      (row) =>
        row.studentName === filteredData[index].studentName &&
        row.locationCourse === filteredData[index].locationCourse &&
        row.lessonAllocationId === filteredData[index].lessonAllocationId
    );

    const currentRow = tableData[actualIndex];

    // If the current row is selected, apply to all selected rows
    if (currentRow.isSelected) {
      const newData = tableData.map((row) =>
        row.isSelected ? { ...row, startDate: date } : row
      );
      setTableData(newData);
    } else {
      // If the current row is not selected, only update this row
      const newData = [...tableData];
      newData[actualIndex].startDate = date;
      setTableData(newData);
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    setTableData(
      tableData.map((row) => ({
        ...row,
        selectedClass: undefined,
        selectedClassId: undefined,
        startDate: undefined,
      }))
    );
    setShowClearModal(false);
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['生徒名', 'Lesson Allocation', '拠点コース名', 'クラス', '開始日'],
      ...tableData.map((row) => [
        row.studentName,
        row.lessonAllocationId,
        row.locationCourse,
        row.selectedClassId || '',
        row.startDate
          ? `${row.startDate}T14:00:00.000+0900`
          : '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'class_assignment.csv';
    link.click();
  };

  // Check if all filtered rows are selected (for header checkbox state)
  const allFilteredSelected = filteredData.length > 0 && filteredData.every((row) => row.isSelected);

  return (
    <div className="bg-white rounded-lg p-8 max-w-6xl mx-auto min-w-6xl">
      <ProgressBar currentStep={3} />

      {/* Filters and Buttons */}
      <div className="flex justify-between items-center mb-6 mt-8">
        <div className="flex items-center gap-4 flex-[2]">
          <button
            onClick={handleToggleAllRows}
            className="w-17 px-2 py-1.5 bg-[#4379EE] text-white rounded-md text-xs font-bold hover:bg-blue-600 transition-colors relative z-10"
          >
            全選択/
            全解除
          </button>

          {/* Student Filter */}
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="w-60 px-4 py-3 ml-5 border border-[#4379EE] rounded-md text-[#4379EE] text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">▼ 生徒を選択</option>
            {uniqueStudents.map((student, idx) => (
              <option key={idx} value={student}>
                {student}
              </option>
            ))}
          </select>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-80 px-4 py-3 border border-[#4379EE] rounded-md text-[#4379EE] text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">▼ 拠点コースを選択</option>
            {uniqueCourses.map((course, idx) => (
              <option key={idx} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowClearModal(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 transition-colors"
          >
            入力値を全てクリア
          </button>
          <button
            onClick={handleExport}
            className="px-8 py-3 bg-[#4379EE] text-white rounded-md text-base font-bold hover:bg-blue-600 transition-colors"
          >
            ダウンロードCSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#BCD1FF] bg-opacity-30 border-b border-gray-300 px-4 py-4">
          <div className="grid grid-cols-[auto_1fr_1.5fr_1.5fr_1fr] gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllFiltered}
                className={`w-5 h-5 border border-[#B3B3B3] rounded-sm hover:bg-gray-100 flex items-center justify-center transition-colors ${
                  allFilteredSelected ? 'bg-[#0088FF] border-[#0088FF]' : 'bg-white'
                }`}
                title="表示中の生徒を全選択"
              >
                {allFilteredSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6666 3.5L5.25 9.91667L2.33334 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="font-bold text-sm text-[#202224]">生徒名</div>
            <div className="font-bold text-sm text-[#202224]">拠点コース</div>
            <div className="font-bold text-sm text-[#202224]">クラス</div>
            <div className="font-bold text-sm text-[#202224]">開始日</div>
          </div>
        </div>

        {/* Rows */}
        {filteredData.map((row, idx) => {
          const classes = getClassesForCourse(row.locationCourse);

          return (
            <div
              key={idx}
              className={`border-b border-gray-200 px-4 py-3 transition-colors ${
                row.isSelected ? 'bg-[#BCD1FF] bg-opacity-30' : 'bg-white'
              }`}
            >
              <div className="grid grid-cols-[auto_1fr_1.5fr_1.5fr_1fr] gap-4 items-center">
                {/* Checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={row.isSelected || false}
                    onChange={() => handleRowSelect(idx)}
                    className="w-5 h-5 border border-[#B3B3B3] rounded-sm cursor-pointer accent-[#0088FF]"
                  />
                </div>

                {/* Student Name */}
                <div className="text-sm text-[#6E6E6E] font-bold">
                  {row.studentName}
                </div>

                {/* Location Course */}
                <div className="text-sm text-[#6E6E6E]">
                  {row.locationCourse}
                </div>

                {/* Class Dropdown */}
                <div className="relative">
                  <select
                    value={row.selectedClassId || ''}
                    onChange={(e) => handleClassChange(idx, e.target.value)}
                    className="w-full px-3 py-3 border border-[#4379EE] rounded-md text-[#4379EE] text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">▼ 選択してください</option>
                    {classes.map((cls, clsIdx) => (
                      <option key={clsIdx} value={cls.classId}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={row.startDate || ''}
                    onChange={(e) => handleDateChange(idx, e.target.value)}
                    className="flex-1 px-3 py-3 border border-[#4379EE] rounded-md text-[#4379EE] text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 border border-[#a2a2a2] max-w-lg shadow-xl">
            <p className="text-center text-base mb-8 text-black">
              ここまで入力したクラスと開始日を全て消去してもよろしいですか?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-8 py-3 border-2 border-[#4379EE] text-[#0088FF] bg-white rounded-md text-base font-bold hover:bg-blue-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleClearAll}
                className="px-8 py-3 bg-red-600 text-white rounded-md text-base font-bold hover:bg-red-700 transition-colors"
              >
                消去する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}