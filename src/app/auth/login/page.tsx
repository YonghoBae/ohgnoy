'use client';

import { useState } from 'react';
import { UserLogin } from '@/interfaces/user';
import { useRouter } from 'next/navigation';
import FormAlert from '@/app/_components/formAlert';
import { userApi } from '@/lib/api/user';
import { inputClass, buttonPrimaryClass } from '@/lib/utils';

const Login = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserLogin>({
    email: '',
    password: '',
  });

  const [emailErr, setEmailErr] = useState<boolean>(false);
  const [passwordErr, setPasswordErr] = useState<boolean>(false);

  const changeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const loginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await userApi.login(user);

      if (result.code == 2000) {
        localStorage.setItem('token', result.data);
        router.push('/');
      } else if (result.message == 'NotExitEmail') {
        setEmailErr(true);
      } else if (result.message == 'InCorrectPassword') {
        setPasswordErr(true);
      }
    } catch (err) {
      console.error('API 에러발생 : /user/login');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          로그인
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={loginSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                value={user.email}
                onChange={changeUser}
                type="email"
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>
            {emailErr && (
              <FormAlert
                message="존재하지 않는 이메일입니다."
                onClose={() => setEmailErr(false)}
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6">
                Password
              </label>
              <div className="text-sm">
                <a href="/auth/forgot" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                value={user.password}
                onChange={changeUser}
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
              />
              {passwordErr && (
                <FormAlert
                  message="비밀번호가 올바르지 않습니다."
                  onClose={() => setPasswordErr(false)}
                />
              )}
            </div>
          </div>

          <div>
            <button type="submit" className={buttonPrimaryClass}>
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-text-muted">
          Not a member?{' '}
          <a href="/auth/regist" className="font-semibold leading-6 text-primary hover:text-primary-hover transition-colors">
            Start a 14 day free trial
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
