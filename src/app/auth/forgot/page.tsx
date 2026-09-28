import Link from 'next/link';

const linkClass =
  'font-semibold text-primary hover:text-primary-hover transition-colors';

const Forgot = () => {
  return (
    <div id="auth-shell-root" className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 className="text-2xl font-bold leading-9 tracking-tight">
          비밀번호 찾기
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          비밀번호 찾기 기능은 준비 중입니다.
        </p>
        <p className="mt-10 flex justify-center gap-6 text-sm">
          <Link href="/auth/login" className={linkClass}>
            로그인
          </Link>
          <Link href="/" className={linkClass}>
            <span aria-hidden="true">←</span> 홈으로
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Forgot;
