import React, { useContext, useEffect, useState } from 'react';
import styles from './CreateTournamentPopup.module.css';
import { getRequest, postRequest } from '../../../utils/routes';
import { BracketData } from '@playoff-bracket-app/database';
import PopupWithSubmit from '../popupTemplate/PopupWithSubmit';
import { tournamentContext } from '../../../utils/context';
import { useNavigate } from 'react-router-dom';

export default function CreateTournamentPopup() {
  const navigate = useNavigate();
  const [availableBrackets, setAvailableBrackets] = useState<BracketData[]>([]);
  const [selectedBracket, setSelectedBracket] = useState<number>(-1);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleTournamentsChanged = useContext(tournamentContext);

  const handleBracketChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBracket(Number.parseInt(event.target.value));
  };

  const handleCreateClicked = async () => {
    if (selectedBracket < 0) {
      setErrorText('Must select a bracket');
      return;
    }

    setIsLoading(true);

    const response = await postRequest('/api/v1/tournament/create');
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
    const fetchBracketData = async () => {
      const response = await getRequest('/api/v1/brackets');
      const json = await response.json();
      setAvailableBrackets(json.data);
    };

    fetchBracketData().catch(console.error);
  }, []);

  return (
    <PopupWithSubmit
      title="Create Tournament"
      submitButtonText="Create"
      loading={isLoading}
      disabled={isLoading}
      errorText={errorText}
      handlePopupClosed={() => navigate(-1)}
      handleSubmit={() => handleCreateClicked()}
    >
      <select
        id="dropdown"
        name="dropdown"
        className={styles.dropdownSelect}
        onChange={handleBracketChange}
        value={selectedBracket}
        disabled={isLoading}
      >
        <option hidden value={-1}>
          Select...
        </option>
        {availableBrackets.map((bracket) => (
          <option value={bracket.id}>{bracket.bracket_name}</option>
        ))}
      </select>
    </PopupWithSubmit>
  );
}
