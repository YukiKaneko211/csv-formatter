'use client';

import ProgressBar from './ProgressBar';

type FilePreviewProps = {
  fileNumber: 1 | 2;
  step: number;
  data: any[];
  columns: string[];
  onNext: () => void;
  onBack: () => void;
};

export default function FilePreview({
  fileNumber,
  step,
  data,
  columns,
  onNext,
  onBack,
}: FilePreviewProps) {
  const getTitle = () => {
    return fileNumber === 1
      ? '最初のファイルのプレビューを表示中です。'
      : '2つ目のファイルのプレビューを表示中です。';
  };

  const getSubtitle = () => {
    return 'ファイルを変更したい場合は「戻る」、問題なければ「 次へ」を選択してください。';
  };

  return (
    <div className="bg-white rounded-lg p-12 max-w-6xl mx-auto">
      <ProgressBar currentStep={step} />

      <div className="mt-12">
        <div className="mb-6">
          <p className="text-xl mb-2">{getTitle()}</p>
          <p className="text-xl">{getSubtitle()}</p>
        </div>

        <p className="text-base text-gray-600 mb-6">
          プレビューは最初の5行以降は省略されます
        </p>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-[#BCD1FF] bg-opacity-30 border-b border-gray-300 px-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              {columns.map((col, idx) => (
                <div key={idx} className="font-bold text-sm text-[#202224]">
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {data.map((row, idx) => (
            <div
              key={idx}
              className="border-b border-gray-200 px-4 py-4 hover:bg-gray-50"
            >
              <div className="grid grid-cols-3 gap-4">
                {Object.values(row).map((value: any, cellIdx) => (
                  <div key={cellIdx} className="text-sm text-[#6E6E6E]">
                    {value}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border-2 border-[#4379EE] text-[#4379EE] bg-white rounded-md font-bold text-base hover:bg-blue-50 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-[#4379EE] text-white rounded-md font-bold text-base hover:bg-blue-600 transition-colors"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}