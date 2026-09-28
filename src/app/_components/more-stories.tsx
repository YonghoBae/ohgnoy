import { Post } from "@/interfaces/post";
import { PostPreview } from "./post-preview";

type Props = {
  posts: Post[];
  basePath?: string;
};

export function MoreStories({ posts, basePath = "/posts" }: Props) {
  return (
    <section>
      <h1 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
        학습 노트
      </h1>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-16 lg:gap-x-32 gap-y-20 md:gap-y-32 mb-32">
          {posts.map((post) => (
            <PostPreview
              key={post.slug}
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              author={post.author}
              slug={post.slug}
              excerpt={post.excerpt}
              basePath={basePath}
            />
          ))}
        </div>
      ) : (
        <p className="mb-32 text-text-muted">아직 작성된 글이 없습니다.</p>
      )}
    </section>
  );
}
