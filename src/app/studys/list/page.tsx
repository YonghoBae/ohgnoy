import { getAllPosts } from '@/lib/api';
import { MoreStories } from '@/app/_components/more-stories';
import Container from '@/app/_components/container';

const list = () => {
  const allPosts = getAllPosts();
  const morePosts = allPosts.slice(1);
  return (
    <Container>
      {morePosts.length > 0 && <MoreStories posts={morePosts} />}
    </Container>
  );
};

export default list;
