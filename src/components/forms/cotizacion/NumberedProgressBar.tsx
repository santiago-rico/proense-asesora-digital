import React from 'react';

interface StepUi {
  id: number; // 1-indexed
  name: string;
}

interface NumberedProgressBarProps {
  currentStep: number; // 1-indexed, represents the currently active step
  steps: StepUi[];
}

const NumberedProgressBar: React.FC<NumberedProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex w-full min-w-[500px] items-center justify-between py-4 px-1 sm:px-2 md:px-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          // Determine the color of the line *after* this step
          let lineAfterColor = 'bg-gray-300';
          if (isCompleted) {
            lineAfterColor = 'bg-green-500';
          } else if (isActive) {
            lineAfterColor = 'bg-blue-500';
          }

          return (
            <React.Fragment key={step.id}>
              {/* Step Item (Circle & Name) */}
              <div
                className="flex flex-col items-center text-center flex-shrink-0"
                style={{ width: 'clamp(70px, 20%, 110px)' }} // Slightly wider for better mobile readability
              >
                <div
                  className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                    border-2 font-semibold text-sm md:text-base
                    transition-all duration-300 ease-in-out touch-manipulation
                    ${isActive
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                      : isCompleted
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-gray-200 text-gray-700 border-gray-300'}
                  `}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <p
                  className={`
                    mt-1.5 text-xs md:text-sm leading-tight
                    min-h-8 md:min-h-10 flex flex-col justify-center px-1
                    transition-colors duration-300 ease-in-out
                    ${isActive
                      ? 'text-blue-600 font-semibold'
                      : isCompleted
                        ? 'text-green-500 font-medium'
                        : 'text-gray-500'}
                  `}
                  style={{
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                    maxWidth: '100%',
                    lineHeight: '1.2'
                  }}
                >
                  {step.name}
                </p>
              </div>

              {/* Connecting Line (if not the last step) */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 flex items-center mx-1 sm:mx-2 min-w-[20px]">
                  <div
                    className={`
                      h-1 w-full
                      transition-colors duration-300 ease-in-out
                      ${lineAfterColor}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default NumberedProgressBar;
