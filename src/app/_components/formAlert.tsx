type Variant = 'error' | 'success' | 'info';

type AlertProps = {
  message: string;
  onClose: () => void;
  variant?: Variant;
};

const variantClass: Record<Variant, string> = {
  error:   'bg-red-600',
  success: 'bg-green-600',
  info:    'bg-neutral-800 dark:bg-neutral-700',
};

const FormAlert = ({ message, onClose, variant = 'error' }: AlertProps) => {
  return (
    <div
      role="alert"
      className={`relative flex w-full px-4 py-4 text-base text-white rounded-lg font-regular ${variantClass[variant]}`}
      data-dismissible="alert"
    >
      <div className="mr-12">{message}</div>
      <button
        data-dismissible-target="alert"
        onClick={onClose}
        aria-label="알림 닫기"
        className="!absolute top-3 right-3 h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-white transition-all hover:bg-white/10 active:bg-white/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        type="button"
      >
        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      </button>
    </div>
  );
};

export default FormAlert;
