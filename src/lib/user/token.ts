import { UserInfo } from '@/interfaces/user';
import { Ohgnoy_BackendAPI } from '@/lib/constants';

export const userInfo = async (token:string):Promise<UserInfo> => {
    const response = await fetch(`${Ohgnoy_BackendAPI}/token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return result.data;
  };