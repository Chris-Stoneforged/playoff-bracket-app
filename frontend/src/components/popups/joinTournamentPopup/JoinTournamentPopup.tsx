import React, { useContext, useEffect, useState } from 'react';
import styles from './JoinTournamentPopup.module.css';
import PopupWithSubmit from '../popupTemplate/PopupWithSubmit';
import { getRequest, postRequest } from '../../../utils/routes';
import { tournamentContext } from '../../../utils/context';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../loadingSpinner/LoadingSpinner';

type InviteInfo = {
  code: string;
  sender: string;
  bracketName: string;
};

export default function JoinTournamentPopup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const handleTournamentsChanged = useContext(tournamentContext);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null | 'error'>(
    null
  );
  const { inviteCode } = useParams();

  const handleJoinClicked = async () => {
    if (inviteInfo === 'error' || inviteInfo === null) {
      return;
    }

    setIsLoading(true);

    const response = await postRequest(
      `/api/v1/invite/${inviteInfo.code}/accept`
    );
    if (response.status !== 200) {
      setErrorText('Something went wrong');
      setIsLoading(false);
      return;
    }

    const responseData = await response.json();
    handleTournamentsChanged(
      {
        tournamentId: responseData.data.tournamentId,
        bracketName: responseData.data.bracketName,
        memberData: responseData.data.memberData,
      },
      'Added'
    );
  };

  useEffect(() => {
    const loadInviteInfo = async () => {
      const response = await getRequest(`/api/v1/invite/${inviteCode}`);
      if (response.status !== 200) {
        return null;
      }

      const responseJson = await response.json();
      const data: InviteInfo = {
        code: inviteCode ?? '',
        sender: responseJson.data.sender,
        bracketName: responseJson.data.bracketName,
      };
      setInviteInfo(data);
    };

    loadInviteInfo();
  });

  return (
    <PopupWithSubmit
      title="Join Tournament"
      submitButtonText={'Join'}
      loading={isLoading}
      disabled={isLoading}
      errorText={errorText}
      handlePopupClosed={() => navigate(-1)}
      handleSubmit={handleJoinClicked}
    >
      {inviteInfo === null ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      ) : inviteInfo === 'error' ? (
        <div className={styles.errorMessage}>
          There was an error with this invite code!
        </div>
      ) : (
        <div className={styles.inviteMessage}>
          <b>{inviteInfo.sender}</b> has invited you to join their{' '}
          <b>{inviteInfo.bracketName}</b> tournament!
        </div>
      )}
    </PopupWithSubmit>
  );
}
