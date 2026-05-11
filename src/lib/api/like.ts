// like API는 Next.js API 라우트(/api/like)를 통해 백엔드에 프록시됩니다.

type LikeBody = { userId: number; pokemon_id: number };

export const likeApi = {
  toggle: (postId: string | number, body: LikeBody): Promise<unknown> =>
    fetch(`/api/like/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};
