import Link from 'next/link';

const linkClass =
  'font-semibold text-primary hover:text-primary-hover transition-colors';

const CreateStudy = () => {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 className="text-2xl font-bold leading-9 tracking-tight">
          학습 노트 작성
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          학습 노트 작성 기능은 준비 중입니다.
        </p>
        <p className="mt-10 flex justify-center gap-6 text-sm">
          <Link href="/studys/list" className={linkClass}>
            학습 노트
          </Link>
          <Link href="/" className={linkClass}>
            <span aria-hidden="true">←</span> 홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}

export default CreateStudy;
