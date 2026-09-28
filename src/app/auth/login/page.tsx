'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { UserLogin } from '@/interfaces/user';
import { useRouter } from 'next/navigation';
import FormAlert from '@/app/_components/formAlert';
import { userApi } from '@/lib/api/user';
import { inputClass, buttonPrimaryClass } from '@/lib/utils';

type ErrField = 'email' | 'password' | 'general';

const Login = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserLogin>({
    email: '',
    password: '',
  });

  const [err, setErr] = useState<{ field: ErrField; message: string } | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const changeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    if (err?.field === e.target.name) setErr(null);
  };

  const loginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setPending(true);

    try {
      const result = await userApi.login(user);

      // Backend: 2000 ok (data = token), 4040 unknown email, 4010 bad password.
      if (result.code === 2000) {
        localStorage.setItem('token', result.data);
        router.push('/');
      } else if (result.code === 4040) {
        setErr({
          field: 'email',
          message: '가입되지 않은 이메일입니다. 이메일을 확인하거나 회원가입하세요.',
        });
        emailRef.current?.focus();
      } else if (result.code === 4010) {
        setErr({
          field: 'password',
          message: '비밀번호가 올바르지 않습니다. 다시 입력하세요.',
        });
        passwordRef.current?.focus();
      } else {
        setErr({
          field: 'general',
          message: '로그인하지 못했습니다. 잠시 후 다시 시도하세요.',
        });
      }
    } catch (error) {
      console.error('API 에러발생 : /user/login', error);
      setErr({
        field: 'general',
        message: '서버에 연결하지 못했습니다. 잠시 후 다시 시도하세요.',
      });
    } finally {
      setPending(false);
    }
  };

  const fieldProps = (field: ErrField) => ({
    'aria-invalid': err?.field === field || undefined,
    'aria-describedby': err?.field === field ? `${field}-error` : undefined,
  });

  return (
    <div id="auth-shell-root" className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link href="/" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
          <span aria-hidden="true">←</span> 홈으로
        </Link>
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          로그인
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={loginSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6">
              이메일
            </label>
            <div className="mt-2">
              <input
                ref={emailRef}
                id="email"
                name="email"
                value={user.email}
                onChange={changeUser}
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                className={inputClass}
                {...fieldProps('email')}
              />
            </div>
            {err?.field === 'email' && (
              <div id="email-error" className="mt-2">
                <FormAlert message={err.message} onClose={() => setErr(null)} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6">
                비밀번호
              </label>
              <div className="text-sm">
                <Link href="/auth/forgot" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                ref={passwordRef}
                id="password"
                name="password"
                value={user.password}
                onChange={changeUser}
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
                {...fieldProps('password')}
              />
            </div>
            {err?.field === 'password' && (
              <div id="password-error" className="mt-2">
                <FormAlert message={err.message} onClose={() => setErr(null)} />
              </div>
            )}
          </div>

          {err?.field === 'general' && (
            <FormAlert message={err.message} onClose={() => setErr(null)} />
          )}

          <div>
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className={`${buttonPrimaryClass} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {pending ? '로그인 중…' : '로그인'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-text-muted">
          계정이 없으신가요?{' '}
          <Link href="/auth/regist" className="font-semibold leading-6 text-primary hover:text-primary-hover transition-colors">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
