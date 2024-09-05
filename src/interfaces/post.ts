import { type Author } from "./author";

export type Post = {
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  author: Author;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
  preview?: boolean;
};


interface PostDb {
  post_id: number;
  title: string;
  excerpt?: string;
  coverImage?: string;
  date: Date;
  author_id: number;
  ogImage?: string;
  view_cnt: number;
  content: string; // post content가 있다고 가정합니다
  preview: boolean; // 알림 preview 정보 (예상되는 필드 추가)
  author: {
    name: string;
    profileImage?: string;
  }; // author 정보도 추가
}
