'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { UserRegist } from '@/interfaces/user';
import { useRouter } from 'next/navigation';
import FormAlert from '@/app/_components/formAlert';
import { userApi } from '@/lib/api/user';
import { inputClass, buttonPrimaryClass } from '@/lib/utils';

type AuthStatus = 'idle' | 'sending' | 'sent' | 'verified';
type Field = 'nickname' | 'email' | 'auth_code' | 'password_confirm' | 'general';
// POST /users answers with the created user on success and { code, message }
// on failure (4090 duplicate email, 4091 duplicate nickname).
type RegistResult = { code?: number; userId?: number; email?: string };

const RESEND_COOLDOWN = 30;
const disabledClass = 'disabled:cursor-not-allowed disabled:opacity-60';

const Regist = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserRegist>({
    nickname: '',
    email: '',
    password: '',
  });
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [authCode, setAuthCode] = useState<number | undefined>(undefined);
  const [authInput, setAuthInput] = useState('');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [cooldown, setCooldown] = useState(0);

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, setPending] = useState(false);

  const refs = {
    nickname: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    auth_code: useRef<HTMLInputElement>(null),
    password_confirm: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const clearError = (field: Field) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const changeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    if (name === 'nickname' || name === 'email') clearError(name);
    // A code sent to the old address must not verify a new one.
    if (name === 'email' && authStatus !== 'idle') {
      setAuthStatus('idle');
      setAuthCode(undefined);
    }
  };

  const changeAuth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthInput(e.target.value);
    clearError('auth_code');
  };

  const sendMail = async () => {
    const emailInput = refs.email.current;
    if (!user.email.trim() || (emailInput && !emailInput.checkValidity())) {
      setErrors((prev) => ({ ...prev, email: '올바른 이메일 주소를 입력하세요.' }));
      emailInput?.focus();
      return;
    }

    clearError('email');
    setAuthStatus('sending');
    try {
      const result = await userApi.sendVerificationEmail(user.email);
      if (result.code !== 2000 || result.data == null) throw new Error(result.message);
      setAuthCode(result.data);
      setAuthStatus('sent');
      setCooldown(RESEND_COOLDOWN);
      refs.auth_code.current?.focus();
    } catch (err) {
      console.log('백엔드 API 오류: /user/email\n', err);
      setAuthStatus('idle');
      setErrors((prev) => ({
        ...prev,
        email: '인증번호를 보내지 못했습니다. 이메일을 확인하고 다시 시도하세요.',
      }));
      emailInput?.focus();
    }
  };

  const compareAuthCode = () => {
    if (authCode !== undefined && String(authCode) === authInput.trim()) {
      setAuthStatus('verified');
      clearError('auth_code');
    } else {
      setErrors((prev) => ({
        ...prev,
        auth_code: '잘못된 인증번호입니다. 다시 입력해주세요.',
      }));
      refs.auth_code.current?.focus();
    }
  };

  const registSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const next: Partial<Record<Field, string>> = {};
    if (authStatus !== 'verified') {
      next.auth_code = '이메일 인증을 완료해야 가입할 수 있습니다. 인증번호를 받아 확인하세요.';
    }
    if (user.password !== passwordConfirm) {
      next.password_confirm = '비밀번호가 일치하지 않습니다.';
    }
    setErrors(next);
    if (next.auth_code) return refs.auth_code.current?.focus();
    if (next.password_confirm) return refs.password_confirm.current?.focus();

    setPending(true);
    try {
      const result = (await userApi.register(user)) as RegistResult;

      if (result.code === undefined && (result.userId !== undefined || result.email)) {
        router.push('/auth/login');
      } else if (result.code === 4090) {
        setErrors({ email: '이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용하세요.' });
        refs.email.current?.focus();
      } else if (result.code === 4091) {
        setErrors({ nickname: '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력하세요.' });
        refs.nickname.current?.focus();
      } else {
        setErrors({ general: '가입하지 못했습니다. 잠시 후 다시 시도하세요.' });
      }
    } catch (err) {
      console.error('API 에러발생 : /user/register', err);
      setErrors({ general: '서버에 연결하지 못했습니다. 잠시 후 다시 시도하세요.' });
    } finally {
      setPending(false);
    }
  };

  const fieldProps = (field: Field, extraDescribedBy?: string) => {
    const ids = [errors[field] && `${field}-error`, extraDescribedBy].filter(Boolean);
    return {
      'aria-invalid': errors[field] ? true : undefined,
      'aria-describedby': ids.length ? ids.join(' ') : undefined,
    };
  };

  const fieldError = (field: Field) =>
    errors[field] && (
      <div id={`${field}-error`} className="mt-2">
        <FormAlert message={errors[field]!} onClose={() => clearError(field)} />
      </div>
    );

  const sendLabel =
    authStatus === 'sending'
      ? '발송 중…'
      : cooldown > 0
        ? `다시 보내기 (${cooldown}초)`
        : authCode !== undefined
          ? '다시 보내기'
          : '인증번호 보내기';

  return (
    <div id="auth-shell-root" className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link href="/" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
          <span aria-hidden="true">←</span> 홈으로
        </Link>
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          회원가입
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={registSubmit}>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium leading-6">
              닉네임
            </label>
            <div className="mt-2">
              <input
                ref={refs.nickname}
                id="nickname"
                name="nickname"
                type="text"
                value={user.nickname}
                onChange={changeUser}
                required
                autoComplete="nickname"
                spellCheck={false}
                className={inputClass}
                {...fieldProps('nickname')}
              />
            </div>
            {fieldError('nickname')}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6">
              이메일
            </label>
            <div className="mt-2 space-y-2">
              <input
                ref={refs.email}
                id="email"
                name="email"
                type="email"
                value={user.email}
                onChange={changeUser}
                required
                autoComplete="email"
                spellCheck={false}
                className={inputClass}
                {...fieldProps('email')}
              />
              {fieldError('email')}
              <button
                type="button"
                onClick={sendMail}
                disabled={authStatus === 'sending' || cooldown > 0}
                aria-busy={authStatus === 'sending'}
                className={`${buttonPrimaryClass} ${disabledClass}`}
              >
                {sendLabel}
              </button>

              <div id="email-status" aria-live="polite">
                {authStatus === 'sent' && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    인증번호를 발송했습니다. 이메일을 확인해주세요.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="auth_code" className="block text-sm font-medium leading-6">
                  인증번호
                </label>
                <input
                  ref={refs.auth_code}
                  id="auth_code"
                  name="auth_code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  required
                  value={authInput}
                  onChange={changeAuth}
                  className={inputClass}
                  {...fieldProps('auth_code', 'auth_code-status')}
                />
                {fieldError('auth_code')}
                <button
                  type="button"
                  onClick={compareAuthCode}
                  className={buttonPrimaryClass}
                >
                  인증번호 확인
                </button>

                <div id="auth_code-status" aria-live="polite">
                  {authStatus === 'verified' && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      <span aria-hidden="true">✓</span> 인증 완료
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6">
              비밀번호
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={user.password}
                onChange={changeUser}
                required
                minLength={8}
                autoComplete="new-password"
                aria-describedby="password-hint"
                className={inputClass}
              />
            </div>
            <p id="password-hint" className="mt-2 text-sm text-text-muted">
              8자 이상 입력하세요.
            </p>
          </div>

          <div>
            <label htmlFor="password_confirm" className="block text-sm font-medium leading-6">
              비밀번호 확인
            </label>
            <div className="mt-2">
              <input
                ref={refs.password_confirm}
                id="password_confirm"
                name="password_confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  clearError('password_confirm');
                }}
                required
                autoComplete="new-password"
                className={inputClass}
                {...fieldProps('password_confirm')}
              />
            </div>
            {fieldError('password_confirm')}
          </div>

          {errors.general && (
            <FormAlert message={errors.general} onClose={() => clearError('general')} />
          )}

          <div>
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className={`${buttonPrimaryClass} ${disabledClass}`}
            >
              {pending ? '가입 중…' : '회원가입'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-text-muted">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="font-semibold leading-6 text-primary hover:text-primary-hover transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Regist;
