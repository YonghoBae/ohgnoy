import { Post } from '@/interfaces/post';
import { UserInfo } from '@/interfaces/user';
import fs from 'fs';
import matter from 'gray-matter';
import { join } from 'path';

const postsDirectory = join(process.cwd(), '_posts');

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  if(!slug){
    return null;
  }

  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  
  if(!fs.existsSync(fullPath)){
    console.error(`File not found: ${fullPath}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    title: data.title ?? '',
    date: data.date ?? '',
    coverImage: data.coverImage ?? '',
    excerpt: data.excerpt ?? '',
    author: {
      name: data.author?.name ?? '',
      picture: data.author?.picture ?? '',
    },
    ogImage: {
      url: data.ogImage?.url ?? '',
    },
    content: content ?? '',
    preview: data.preview ?? false,
  } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
