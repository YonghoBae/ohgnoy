export type UserRegist = {
  nick_name: string;
  email: string;
  password: string;
};

export type UserLogin = {
  email: string;
  password: string;
};

export type UserInfo = {
  user_id: number;
  nick_name: string;
  email: string;
};
