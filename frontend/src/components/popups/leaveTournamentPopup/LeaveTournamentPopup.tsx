import React, { useContext, useState } from 'react';
import styles from './LeaveTournamentPopup.module.css';
import PopupWithSubmit from '../popupTemplate/PopupWithSubmit';
import { tournamentContext } from '../../../utils/context';
import { postRequest } from '../../../utils/routes';
import { useNavigate, useParams } from 'react-router-dom';

export default function LeaveTournamentPopup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const handleTournamentsChanged = useContext(tournamentContext);
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const currentTournamentId: number = tournamentId
    ? Number.parseInt(tournamentId)
    : -1;

  const handleSubmitClicked = async () => {
    setIsLoading(true);
    const response = await postRequest(
      `/api/v1/tournament/${currentTournamentId}/leave`
    );

    if (response.status !== 200) {
      setErrorText('Something went wrong!');
      setIsLoading(false);
      return;
    }

    handleTournamentsChanged(
      { tournamentId: currentTournamentId, bracketName: '', memberData: [] },
      'Removed'
    );
  };

  return (
    <PopupWithSubmit
      title="Leave Tournament"
      disabled={isLoading}
      errorText={errorText}
      loading={isLoading}
      submitButtonText="Leave"
      handlePopupClosed={() => navigate(-1)}
      handleSubmit={handleSubmitClicked}
    >
      <div className={styles.leaveText}>
        Are you sure you want to leave the tournament?
      </div>
    </PopupWithSubmit>
  );
}
