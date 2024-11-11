'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormAlert from '@/app/_components/formAlert';
import { Ohgnoy_BackendAPI } from '@/lib/constants';

const CreatePost = () => {
  const router = useRouter();

  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    coverImage: null,
  });

  const [titleErr, setTitleErr] = useState(false);
  const [excerptErr, setExcerptErr] = useState(false);

  const changePost = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target;
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
      const token = localStorage.getItem('token');

      const response = await fetch(`${Ohgnoy_BackendAPI}/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

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
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
