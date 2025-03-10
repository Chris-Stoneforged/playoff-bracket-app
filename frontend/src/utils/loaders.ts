import { Params } from 'react-router-dom';
import { getRequest } from './routes';
import handleResponseError from './errorHandling';

export async function bracketLoader({
  params,
}: {
  params: Params<'tournamentId' | 'userId'>;
}) {
  const response = await getRequest(
    `/api/v1/tournament/${params.tournamentId}/bracket/${params.userId}`
  );

  if (response.status !== 200) {
    return await handleResponseError(response);
  }

  const data = await response.json();
  return data.data;
}
