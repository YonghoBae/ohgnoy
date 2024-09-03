'use client';

import React, { useState } from 'react';
import { EmailAuth, UserRegist } from '@/interfaces/user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BLOG_NAME } from '@/lib/constants';

const Regist = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserRegist>({
    nick_name: '',
    email: '',
    password: '',
  });

  const [auth, setAuth] = useState<EmailAuth>({
    auth_code: undefined,
    auth_code_input: undefined,
  });

  const changeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const changeAuth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuth({ ...auth, auth_code_input: Number(e.target.value) });
  };

  const sendMail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const response = await fetch('http://localhost:3130/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const result = await response.json();

      setAuth({ ...auth, auth_code: result.data });
    } catch (err) {
      console.log('백엔드 API 오류:http://localhost:3130/email\n', err);
    }
  };

  const compareAuthCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      if (auth.auth_code === auth.auth_code_input) {
        alert('인증완료!!!');
      } else {
        alert('잘못된 인증번호입니다. 다시 입력해주세요.');
      }
    } catch (err) {
      console.log('백엔드 API 오류:http://localhost:3130/email\n', err);
    }
  };

  const registSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3130/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const result = await response.json();

      if (result.code == 200) {
        console.log('백엔드에서 제공한 json데이터 확인:', result);
        router.push('/auth/login');
      }
    } catch (err) {
      console.error('API 에러발생 : http://localhost:3130/entry');
    }
  };

  return (
    <>
      <div className="dark:text-stone-50 flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
            <div>
              <Link
                href="/"
                className="text-center mx-auto h-10 w-auto first-letter:hover:underline"
              >
                {BLOG_NAME}
              </Link>
            </div>
            회원가입
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={registSubmit}>
            <div>
              <label
                htmlFor="nick_name"
                className="block text-sm font-medium leading-6"
              >
                닉네임
              </label>
              <div className="mt-2">
                <input
                  id="nick_name"
                  name="nick_name"
                  type="text"
                  value={user.nick_name}
                  onChange={changeUser}
                  required
                  autoComplete="nickname"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6"
              >
                이메일
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={changeUser}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  onClick={sendMail}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  인증번호 보내기
                </button>
              </div>

              <div>
                <label
                  htmlFor="auth_code"
                  className="block text-sm font-medium leading-6"
                >
                  인증번호
                </label>
                <input
                  id="auth_code"
                  name="auth_code"
                  type="auth_code"
                  value={auth.auth_code_input}
                  onChange={changeAuth}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  onClick={compareAuthCode}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  확인
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6"
              >
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password_confirm"
                className="block text-sm font-medium leading-6"
              >
                패스워드 확인
              </label>
              <div className="mt-2">
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                회원가입
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <a
              href="/auth/login"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Regist;
