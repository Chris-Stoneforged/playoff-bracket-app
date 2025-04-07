import React, { useContext, useState } from 'react';
import styles from './MakePredictionPopup.module.css';
import PopupWithSubmit from '../popupTemplate/PopupWithSubmit';
import { BracketStateData, MatchupData } from '@playoff-bracket-app/database';
import logos from '../../../utils/logos';
import { postRequest } from '../../../utils/routes';
import { tournamentIdContext } from '../../../utils/context';

export type MakePredictionPopupProps = {
  matchupName: string;
  matchup: MatchupData;
  handleBracketChanged: (bracketState: BracketStateData) => void;
  handlePopupClosed: () => void;
};

export default function MakePredictionPopup({
  matchupName,
  matchup,
  handleBracketChanged,
  handlePopupClosed,
}: MakePredictionPopupProps) {
  const tournamentId = useContext(tournamentIdContext);
  const [numberOfGames, setNumberOfGames] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<string>('______');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  if (
    matchup.team_a === undefined ||
    matchup.team_b === undefined ||
    matchup.best_of === undefined
  ) {
    throw new Error("Can't make this prediction");
  }

  const handleSubmitClicked = async () => {
    if (selectedTeam !== matchup.team_a && selectedTeam !== matchup.team_b) {
      setErrorText('Select a team to win');
      return;
    }

    if (!options.some((o) => o === numberOfGames)) {
      setErrorText('Choose how many games');
      return;
    }

    setErrorText(null);
    setIsLoading(true);

    const response = await postRequest(
      `/api/v1/tournament/${tournamentId}/prediction`,
      {
        matchup: matchup.id,
        predictedWinner: selectedTeam,
        numberOfGames: numberOfGames,
      }
    );

    if (response.status !== 200) {
      setErrorText('Something went wrong!');
      setIsLoading(false);
      return;
    }

    const json = await response.json();
    handleBracketChanged(json.data);
    handlePopupClosed();
  };

  const handleNumberOfGamesChanged = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setNumberOfGames(Number.parseInt(event.target.value));
  };

  const handleTeamSelected = (team: string) => {
    setSelectedTeam(team);
  };

  const gamesMin = Math.ceil(matchup.best_of / 2);
  const gamesMax = matchup.best_of;
  const options = Array.from(
    { length: gamesMax - gamesMin + 1 },
    (_, i) => gamesMin + i
  );

  return (
    <PopupWithSubmit
      title={matchupName}
      submitButtonText="Submit"
      handleSubmit={() => handleSubmitClicked()}
      handlePopupClosed={handlePopupClosed}
      loading={isLoading}
      disabled={isLoading}
      errorText={errorText}
    >
      <div className={styles.container}>
        <div className={styles.logos}>
          <img
            src={logos[matchup.team_a]}
            alt={matchup.team_a}
            className={`${styles.logoImage} ${
              selectedTeam === matchup.team_a ? styles.selected : ''
            }`}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            onClick={() => handleTeamSelected(matchup.team_a!)}
          ></img>
          VS
          <img
            src={logos[matchup.team_b]}
            alt={matchup.team_b}
            className={`${styles.logoImage} ${
              selectedTeam === matchup.team_b ? styles.selected : ''
            }`}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            onClick={() => handleTeamSelected(matchup.team_b!)}
          ></img>
        </div>
        <div className={styles.declaration}>
          <b>{selectedTeam}</b>&nbsp;&nbsp;in
          <select
            id="dropdown"
            name="dropdown"
            className={styles.dropdownSelect}
            onChange={handleNumberOfGamesChanged}
            value={numberOfGames}
            disabled={isLoading}
          >
            <option hidden value={-1}>
              Select...
            </option>
            {options.map((option) => (
              <option value={option}>{`${option}`}</option>
            ))}
          </select>
        </div>
      </div>
    </PopupWithSubmit>
  );
}
