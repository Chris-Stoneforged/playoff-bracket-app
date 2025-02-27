import { Params } from 'react-router-dom';
import { getRequest, postRequest } from './routes';
import handleResponseError from './errorHandling';

export async function tournamentDetailLoader({
  params,
}: {
  params: Params<'tournamentId'>;
}) {
  const response = await getRequest(
    `/api/v1/tournament/${params.tournamentId}`
  );

  if (response.status !== 200) {
    return await handleResponseError(response);
  }

  const data = await response.json();
  return data.data;
}

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

export type InviteInfo = {
  code: string;
  sender: string;
  bracketName: string;
};

export async function joinTournamentLoader({
  params,
}: {
  params: Params<'inviteCode'>;
}) {
  const response = await getRequest(`/api/v1/invite/${params.inviteCode}`);
  if (response.status !== 200) {
    return null;
  }

  const responseJson = await response.json();
  const data: InviteInfo = {
    code: params.inviteCode ?? '',
    sender: responseJson.data.sender,
    bracketName: responseJson.data.bracketName,
  };
  return data;
}

export async function inviteCodeLoader({
  params,
}: {
  params: Params<'tournamentId'>;
}) {
  const response = await postRequest(
    `/api/v1/tournament/${params.tournamentId}/generate-invite-code`
  );
  if (response.status !== 200) {
    return null;
  }

  const json = await response.json();
  const baseUrl = import.meta.env.VITE_URL;
  return `${baseUrl}/join/${json.data}`;
}
