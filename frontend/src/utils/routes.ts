import { getCookie } from './loginUtils';

export const routes = {
  user: {
    login: '/api/v1/user/login',
    register: '/api/v1/user/register',
    logout: '/api/v1/user/logout',
    userData: '/api/v1/user',
  },
  tournaments: {
    details: '/api/v1/tournament/',
  },
  admin: {},
  brackets: {},
};

export const postRequest = async (
  route: string,
  body: object = {}
): Promise<Response> => {
  const loginCookie = getCookie('playoff-preditor-token');
  return await fetch(route, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginCookie}`,
    },
  });
};

export const getRequest = async (
  route: string,
  signal?: AbortSignal
): Promise<Response> => {
  const loginCookie = getCookie('playoff-preditor-token');
  const params: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginCookie}`,
    },
  };
  if (signal) {
    params.signal = signal;
  }
  return await fetch(route, params);
};
