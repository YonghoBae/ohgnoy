import { BLOG_NAME } from '@/lib/constants';
import Link from 'next/link';

export function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        {BLOG_NAME}.
      </h1>
      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
        <Link
          href="/studys/list"
          className="hover:underline hover:text-blue-600 duration-200 transition-colors"
        >
          Study
        </Link>{' '}
        <Link
          href="/chat"
          className="hover:underline hover:text-blue-600 duration-200 transition-colors"
        >
          Chat
        </Link>{' '}
        <Link
          href="/auth/login"
          className="hover:underline hover:text-blue-600 duration-200 transition-colors"
        >
          Login
        </Link>{' '}
        <Link
          href="/auth/regist"
          className="hover:underline hover:text-blue-600 duration-200 transition-colors"
        >
          Regist
        </Link>{' '}
      </h4>
    </section>
  );
}
