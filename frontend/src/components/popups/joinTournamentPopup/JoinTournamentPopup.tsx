import React, { useContext, useState } from 'react';
import styles from './JoinTournamentPopup.module.css';
import PopupWithSubmit from '../popupTemplate/PopupWithSubmit';
import { postRequest } from '../../../utils/routes';
import { tournamentContext } from '../../../utils/context';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { InviteInfo } from '../../../utils/loaders';

export default function JoinTournamentPopup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const handleTournamentsChanged = useContext(tournamentContext);
  const inviteInfo: InviteInfo | null = useLoaderData() as InviteInfo | null;

  const handleJoinClicked = async () => {
    if (inviteInfo === null) {
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
