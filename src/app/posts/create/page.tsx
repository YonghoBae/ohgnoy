'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormAlert from '@/app/_components/formAlert';
import { postApi } from '@/lib/api/post';
import { inputClass, buttonPrimaryClass } from '@/lib/utils';

const CreatePost = () => {
  const router = useRouter();

  const [post, setPost] = useState<{
    title: string;
    excerpt: string;
    coverImage: File | null;
  }>({
    title: '',
    excerpt: '',
    coverImage: null,
  });


  const [titleErr, setTitleErr] = useState(false);
  const [excerptErr, setExcerptErr] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/auth/login');
    }
  }, [router]);

  const dirty = !!(post.title || post.excerpt || post.coverImage);
  useEffect(() => {
    if (!dirty || pending || submitted) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, pending, submitted]);

  const changePost = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'coverImage') {
      setPost({ ...post, coverImage: files ? files[0] : null });
    } else {
      setPost({ ...post, [name]: value });
    }
    if (name === 'title') setTitleErr(false);
    if (name === 'excerpt') setExcerptErr(false);
  };

  const postSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const noTitle = !post.title.trim();
    const noExcerpt = !post.excerpt.trim();
    setTitleErr(noTitle);
    setExcerptErr(noExcerpt);
    setSubmitErr(null);
    if (noTitle) return titleRef.current?.focus();
    if (noExcerpt) return excerptRef.current?.focus();

    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify({ title: post.title, excerpt: post.excerpt })], {
        type: 'application/json',
      }),
    );
    if (post.coverImage) {
      formData.append('coverImage', post.coverImage);
    }

    setPending(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      // Backend error shapes vary: CustomException gives { code, message }
      // (English message, never shown verbatim); a Spring validation 400
      // gives { status: 400, error, ... } instead. postApi's type only
      // declares the success/CustomException fields, so widen locally.
      const result: Awaited<ReturnType<typeof postApi.create>> & {
        status?: number;
        error?: string;
      } = await postApi.create(formData, token);

      if (result.postId != null) {
        setSubmitted(true);
        router.push('/');
      } else if (result.code === 4010 || result.status === 401 || result.status === 403) {
        setSubmitErr('로그인이 만료되었을 수 있습니다. 다시 로그인한 뒤 시도하세요.');
      } else if (result.status === 400) {
        setSubmitErr('제목과 요약 내용을 확인해주세요.');
      } else {
        setSubmitErr('게시글을 등록하지 못했습니다. 잠시 후 다시 시도하세요.');
      }
    } catch (err) {
      console.error('API 에러 발생', err);
      setSubmitErr('로그인이 만료되었을 수 있습니다. 다시 로그인한 뒤 시도하세요.');
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 text-text-base">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h1 className="mt-10 text-center text-2xl font-bold leading-9">
            게시글 작성
          </h1>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={postSubmit}>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6"
              >
                제목
              </label>
              <div className="mt-2">
                <input
                  ref={titleRef}
                  id="title"
                  name="title"
                  value={post.title}
                  onChange={changePost}
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="off"
                  aria-invalid={titleErr || undefined}
                  aria-describedby={titleErr ? 'title-error' : undefined}
                  className={inputClass}
                />
                {titleErr && (
                  <div id="title-error" className="mt-2">
                    <FormAlert message="제목을 입력해주세요." onClose={() => setTitleErr(false)} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium leading-6"
              >
                내용 요약
              </label>
              <div className="mt-2">
                <textarea
                  ref={excerptRef}
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt}
                  onChange={changePost}
                  required
                  rows={6}
                  maxLength={300}
                  aria-invalid={excerptErr || undefined}
                  aria-describedby={excerptErr ? 'excerpt-error' : undefined}
                  className={inputClass}
                />
                {excerptErr && (
                  <div id="excerpt-error" className="mt-2">
                    <FormAlert message="내용 요약을 입력해주세요." onClose={() => setExcerptErr(false)} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="coverImage"
                className="block text-sm font-medium leading-6"
              >
                표지 이미지
              </label>
              <div className="mt-2">
                <input
                  id="coverImage"
                  name="coverImage"
                  onChange={changePost}
                  type="file"
                  accept="image/*"
                  className={inputClass}
                />
              </div>
            </div>

            {submitErr && (
              <FormAlert message={submitErr} onClose={() => setSubmitErr(null)} />
            )}

            <div>
              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className={`${buttonPrimaryClass} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {pending ? '등록 중…' : '게시글 작성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
