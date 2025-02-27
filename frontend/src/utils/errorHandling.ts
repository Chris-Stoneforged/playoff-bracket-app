import { redirect } from 'react-router-dom';

export default async function handleResponseError(
  response: Response
): Promise<Response> {
  if (response.status === 401) {
    return redirect('/login');
  }
  if (response.status === 500) {
    throw new Error('500 Internal Server Error');
  }

  throw new Error('404 Not found');
}
