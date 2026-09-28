export type UserRegist = {
  nickname: string;
  email: string;
  password: string;
};

export type UserLogin = {
  email: string;
  password: string;
};

export type UserInfo = {
  userId: number;
  nickname: string;
  email: string;
};
