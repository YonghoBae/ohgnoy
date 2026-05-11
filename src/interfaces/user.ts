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

export type EmailAuth = {
  auth_code: number | undefined;
  auth_code_input: number | undefined;
};
