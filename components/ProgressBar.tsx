type ProgressBarProps = {
  currentStep: number;
};

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { number: 1, label: '1' },
    { number: 1.5, label: '1.5' },
    { number: 2, label: '2' },
    { number: 2.5, label: '2.5' },
    { number: 3, label: '3' },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-8">
      {/* Progress Line */}
      <div className="absolute top-9 left-[43px] right-[43px] h-[5px] bg-[#BCD1FF]">
        <div
          className="h-full bg-[#4379EE] transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / 2) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between items-center px-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                {isCompleted ? (
                  <div className="w-16 h-16 rounded-full bg-[#4379EE] flex items-center justify-center">
                    <svg
                      width="32"
                      height="22"
                      viewBox="0 0 32 22"
                      fill="none"
                    >
                      <path
                        d="M2 11L11 20L30 2"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <>
                    {isCurrent && (
                      <div className="absolute inset-0 w-20 h-20 -top-2 -left-2 rounded-full border-3 border-[#4379EE]" />
                    )}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                        isActive
                          ? 'bg-[#4379EE] border-[#4379EE]'
                          : 'bg-white border-[#4379EE]'
                      }`}
                    >
                      <span
                        className={`text-2xl font-extrabold ${
                          isActive ? 'text-white' : 'text-[#4379EE]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}