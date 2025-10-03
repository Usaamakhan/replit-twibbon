export default function CampaignStepIndicator({ currentStep }) {
  const steps = [1, 2, 3];

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl transition-colors ${
                step < currentStep
                  ? 'bg-emerald-500 text-white'
                  : step === currentStep
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-400 text-white'
              }`}
            >
              {step}
            </div>

            {/* Connecting Line (not shown after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`w-20 sm:w-32 h-1 mx-1 transition-colors ${
                  step < currentStep
                    ? 'bg-emerald-500'
                    : step === currentStep
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
