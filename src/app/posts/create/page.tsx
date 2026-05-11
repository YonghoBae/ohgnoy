'use client';

import { useState } from 'react';
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

  const changePost = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'coverImage') {
      setPost({ ...post, coverImage: files ? files[0] : null });
    } else {
      setPost({ ...post, [name]: value });
    }
  };

  const postSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', post.title);
    formData.append('excerpt', post.excerpt);
    if (post.coverImage) {
      formData.append('coverImage', post.coverImage);
    }

    try {
      const token = localStorage.getItem('token') ?? '';
      const result = await postApi.create(formData, token);

      if (result.msg === 'Success') {
        router.push('/');
      } else {
        if (result.msg === 'ServerError') {
          console.error('서버 에러 발생');
        }
      }
    } catch (err) {
      console.error('API 에러 발생');
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 text-text-base">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9">
            게시글 작성
          </h2>
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
                  id="title"
                  name="title"
                  value={post.title}
                  onChange={changePost}
                  type="text"
                  required
                  className={inputClass}
                />
                {titleErr && <FormAlert message="제목을 입력해주세요." onClose={() => setTitleErr(false)} />}
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
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt}
                  onChange={changePost}
                  required
                  className={inputClass}
                />
                {excerptErr && <FormAlert message="내용 요약을 입력해주세요." onClose={() => setExcerptErr(false)} />}
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
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={buttonPrimaryClass}
              >
                게시글 작성
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
