import React from 'react';
import styles from './BracketEntry.module.css';
import { MatchupStateData } from '@playoff-bracket-app/database';
import BracketTeam from './BracketTeam';
import { ArcherElement } from 'react-archer';

export type BracketEntryProps = {
  state: MatchupStateData;
  locked: boolean;
  rootMatchupId: number;
  handleMakePredictionClicked: () => void;
};

export default function BracketEntry({
  state,
  locked,
  rootMatchupId,
  handleMakePredictionClicked,
}: BracketEntryProps) {
  const winnerDecided = state.winner;
  const hasMadePrediction = state.predictedWinner !== undefined;
  const predictionNotInTeams =
    state.predictedWinner &&
    state.predictedWinner !== state.team_a &&
    state.predictedWinner !== state.team_b;

  const correctTeam =
    winnerDecided &&
    hasMadePrediction &&
    state.predictedWinner === state.winner;
  const incorrectTeam =
    winnerDecided &&
    hasMadePrediction &&
    state.predictedWinner !== state.winner;
  const correctNumberOfGames =
    correctTeam &&
    state.number_of_games === state.team_a_wins + state.team_b_wins;
  const inccorectNumberOfGames =
    winnerDecided &&
    state.number_of_games !== state.team_a_wins + state.team_b_wins;

  return (
    <ArcherElement
      id={`${state.id}`}
      relations={[
        {
          targetId: `${state.advances_to}`,
          targetAnchor:
            state.advances_to === rootMatchupId
              ? 'bottom'
              : state.left_side
              ? 'left'
              : 'right',
          sourceAnchor:
            state.advances_to === rootMatchupId
              ? 'top'
              : state.left_side
              ? 'right'
              : 'left',
        },
      ]}
    >
      <div
        className={`${styles.container} ${
          state.winner && state.predictedWinner
            ? state.winner === state.predictedWinner
              ? styles.correct
              : styles.incorrect
            : predictionNotInTeams
            ? styles.incorrect
            : ''
        }`}
      >
        <div className={styles.logos}>
          <BracketTeam
            team={state.team_a}
            predictedTeam={state.predictedWinner}
            victoriousTeam={state.winner}
          />
          vs
          <BracketTeam
            team={state.team_b}
            predictedTeam={state.predictedWinner}
            victoriousTeam={state.winner}
          />
        </div>
        <div
          className={styles.wins}
        >{`${state.team_a_wins} - ${state.team_b_wins}`}</div>
        <div className={styles.predictionArea}>
          {locked && !hasMadePrediction && 'Did not pick'}
          {hasMadePrediction && (
            <text>
              Picked{' '}
              <b
                className={
                  correctTeam
                    ? styles.correctText
                    : incorrectTeam
                    ? styles.incorrectText
                    : ''
                }
              >
                {state.predictedWinner}
              </b>{' '}
              in{' '}
              <b
                className={
                  correctNumberOfGames
                    ? styles.correctText
                    : inccorectNumberOfGames
                    ? styles.incorrectText
                    : ''
                }
              >
                {' '}
                {state.number_of_games}
              </b>
            </text>
          )}
          {state.requires_prediction && !hasMadePrediction && !locked && (
            <button onClick={handleMakePredictionClicked}>
              Make Prediction
            </button>
          )}
        </div>
      </div>
    </ArcherElement>
  );
}
