import { getAllPosts } from '@/lib/api';
import { MoreStories } from '@/app/_components/more-stories';
import Container from '@/app/_components/container';

const list = () => {
  const allPosts = getAllPosts();
  return (
    <Container>
      <MoreStories posts={allPosts} basePath="/studys" />
    </Container>
  );
};

export default list;
