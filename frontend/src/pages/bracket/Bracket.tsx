import React, { useEffect, useState } from 'react';
import styles from './Bracket.module.css';
import { useLoaderData } from 'react-router-dom';
import {
  BracketStateData,
  MatchupData,
  MatchupStateData,
} from '@playoff-bracket-app/database';
import BracketEntry from '../../components/bracketEntry/BracketEntry';
import MakePredictionPopup from '../../components/popups/makePredictionPopup/MakePredictionPopup';
import { ArcherContainer, ArcherElement } from 'react-archer';

const defaultMatchup: MatchupData = {
  id: 0,
  advances_to: 0,
  round: 0,
  left_side: false,
  team_a_wins: 0,
  team_b_wins: 0,
};

const defaultBracket: BracketStateData = {
  id: 0,
  bracket_name: '',
  left_side_name: '',
  right_side_name: '',
  root_matchup_id: 0,
  predictions_locked: false,
  matchups: [],
};

export default function Bracket() {
  const bracketState = useLoaderData() as BracketStateData;
  const [bracketData, setBracketData] =
    useState<BracketStateData>(defaultBracket);
  const [isPredictionPopupOpen, setIsPredictionPopupOpen] =
    useState<boolean>(false);
  const [predictedMatchup, setPredictedMatchup] =
    useState<MatchupData>(defaultMatchup);

  useEffect(() => {
    setBracketData(bracketState);
  }, [bracketState]);

  const handleMakePredictionClicked = (matchUp: MatchupData) => {
    setPredictedMatchup(matchUp);
    setIsPredictionPopupOpen(true);
  };

  const handlePredictionMade = (bracketState: BracketStateData) => {
    setBracketData(bracketState);
  };

  const columns: MatchupStateData[][] = [];
  let roundNum = 1;
  let left = true;

  const rootMatchup = bracketData.matchups.find(
    (m) => m.id === bracketData.root_matchup_id
  );
  if (rootMatchup === undefined) {
    return;
  }

  while (roundNum > 0) {
    if (roundNum === rootMatchup?.round) {
      left = false;
      roundNum -= 1;
      continue;
    }

    const matchups = bracketData.matchups
      .filter(
        // eslint-disable-next-line no-loop-func
        (m) => m.round === roundNum && m.left_side === left
      )
      .sort((a, b) => a.id - b.id);
    columns.push(matchups);

    roundNum = left ? roundNum + 1 : roundNum - 1;
  }

  return (
    <ArcherContainer
      strokeColor="#1e488b"
      noCurves={true}
      endMarker={false}
      style={{ height: '100%' }}
    >
      <div className={styles.bracketContainer}>
        {columns.map((c) => (
          <div className={styles.bracketColumn}>
            {c.map((m) => (
              <BracketEntry
                state={m}
                locked={bracketData.predictions_locked}
                rootMatchupId={rootMatchup.id}
                handleMakePredictionClicked={() =>
                  handleMakePredictionClicked(m)
                }
              />
            ))}
          </div>
        ))}
        <div className={styles.finalMatchup}>
          <BracketEntry
            state={rootMatchup}
            locked={bracketData.predictions_locked}
            rootMatchupId={rootMatchup.id}
            handleMakePredictionClicked={() =>
              handleMakePredictionClicked(rootMatchup)
            }
          ></BracketEntry>
        </div>
        {isPredictionPopupOpen && (
          <MakePredictionPopup
            handlePopupClosed={() => setIsPredictionPopupOpen(false)}
            handleBracketChanged={handlePredictionMade}
            matchup={predictedMatchup}
            matchupName={
              predictedMatchup.id === rootMatchup.id
                ? 'Finals'
                : `${
                    predictedMatchup.left_side
                      ? bracketData.left_side_name
                      : bracketData.right_side_name
                  } - Round ${predictedMatchup.round}`
            }
          ></MakePredictionPopup>
        )}
      </div>
    </ArcherContainer>
  );
}
