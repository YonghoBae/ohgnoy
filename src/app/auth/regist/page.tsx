'use client';

import React, { useState } from 'react';
import { EmailAuth, UserRegist } from '@/interfaces/user';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user';
import { inputClass, buttonPrimaryClass } from '@/lib/utils';

type AuthStatus = 'idle' | 'sent' | 'verified' | 'error';

const Regist = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserRegist>({
    nickname: '',
    email: '',
    password: '',
  });

  const [auth, setAuth] = useState<EmailAuth>({
    auth_code: undefined,
    auth_code_input: undefined,
  });

  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');

  const changeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const changeAuth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuth({ ...auth, auth_code_input: Number(e.target.value) });
  };

  const sendMail = async () => {
    try {
      const result = await userApi.sendVerificationEmail(user.email);
      setAuth({ ...auth, auth_code: result.data });
      setAuthStatus('sent');
    } catch (err) {
      console.log('백엔드 API 오류: /user/email\n', err);
      setAuthStatus('error');
    }
  };

  const compareAuthCode = () => {
    if (auth.auth_code === auth.auth_code_input) {
      setAuthStatus('verified');
    } else {
      setAuthStatus('error');
    }
  };

  const registSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await userApi.register(user);

      if (result.code == 200) {
        router.push('/auth/login');
      }
    } catch (err) {
      console.error('API 에러발생 : /user/register');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          회원가입
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={registSubmit}>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium leading-6">
              닉네임
            </label>
            <div className="mt-2">
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={user.nickname}
                onChange={changeUser}
                required
                autoComplete="nickname"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6">
              이메일
            </label>
            <div className="mt-2 space-y-2">
              <input
                id="email"
                name="email"
                type="email"
                value={user.email}
                onChange={changeUser}
                required
                autoComplete="email"
                className={inputClass}
              />
              <button
                type="button"
                onClick={sendMail}
                className={buttonPrimaryClass}
              >
                인증번호 보내기
              </button>

              {authStatus === 'sent' && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  인증번호를 발송했습니다. 이메일을 확인해주세요.
                </p>
              )}

              <div className="space-y-2">
                <label htmlFor="auth_code" className="block text-sm font-medium leading-6">
                  인증번호
                </label>
                <input
                  id="auth_code"
                  name="auth_code"
                  type="number"
                  value={auth.auth_code_input ?? ''}
                  onChange={changeAuth}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={compareAuthCode}
                  className={buttonPrimaryClass}
                >
                  확인
                </button>

                {authStatus === 'verified' && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    ✓ 인증 완료
                  </p>
                )}
                {authStatus === 'error' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    잘못된 인증번호입니다. 다시 입력해주세요.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6">
              패스워드
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={user.password}
                onChange={changeUser}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password_confirm" className="block text-sm font-medium leading-6">
              패스워드 확인
            </label>
            <div className="mt-2">
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <button type="submit" className={buttonPrimaryClass}>
              회원가입
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-text-muted">
          이미 계정이 있으신가요?{' '}
          <a href="/auth/login" className="font-semibold leading-6 text-primary hover:text-primary-hover transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Regist;
