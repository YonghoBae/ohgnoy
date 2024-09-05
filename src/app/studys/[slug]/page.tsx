'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/app/_components/alert";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";

// Post 모델 타입 정의
interface Post {
  post_id: number;
  title: string;
  excerpt?: string;
  coverImage?: string;
  date: string; // 날짜 형식은 string으로 처리
  author_id: number;
  ogImage?: string;
  view_cnt: number;
  content: string; // 게시글 내용
  preview: boolean; // preview 필드
  author: {
    name: string;
    profileImage?: string;
  };
}

export default function Post() {
  const [post, setPost] = useState<Post | null>(null); // 타입을 Post 또는 null로 설정
  const [loading, setLoading] = useState(true); // 로딩 상태
  const router = useRouter();

  useEffect(() => {
    // 클라이언트 측에서 localStorage 및 API 요청 처리
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/auth/login'); // 토큰이 없으면 로그인 페이지로 이동
        return;
      }

      try {
        const response = await fetch('http://localhost:3130/post/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!result.data) {
          router.push('/not-found'); // 게시글이 없을 경우 404 페이지로 이동
        } else {
          setPost(result.data[0]); // 첫 번째 게시글 데이터를 상태에 저장
        }

      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>; // 로딩 중일 때 표시할 내용
  }

  if (!post) {
    return <p>No post found</p>; // 게시글이 없으면 표시할 내용
  }

  return (
    <main>
      <Alert preview={post.preview} />
      <Container>
        <Header />
        <article className="mb-32">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage ?? ''} // 기본값을 빈 문자열로 설정
            date={post.date}
            author={post.author}
          />
          <PostBody content={post.content} />
        </article>
      </Container>
    </main>
  );
}
