import React, { useEffect, useRef, useState } from 'react';
import styles from './Bracket.module.css';
import {
  BracketStateData,
  MatchupData,
  MatchupStateData,
} from '@playoff-bracket-app/database';
import BracketEntry from '../../components/bracketEntry/BracketEntry';
import MakePredictionPopup from '../../components/popups/makePredictionPopup/MakePredictionPopup';
import { ArcherContainer } from 'react-archer';
import { getRequest } from '../../utils/routes';
import handleResponseError from '../../utils/errorHandling';
import { useLocation, useParams } from 'react-router-dom';
import Loadable from '../../components/loadable/Loadable';
import resultCache from '../../utils/cache';

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

const defaultMatchupState: MatchupStateData = {
  ...defaultMatchup,
  requires_prediction: false,
};

export default function Bracket() {
  const [bracketData, setBracketData] =
    useState<BracketStateData>(defaultBracket);
  const [isPredictionPopupOpen, setIsPredictionPopupOpen] =
    useState<boolean>(false);
  const [predictedMatchup, setPredictedMatchup] =
    useState<MatchupData>(defaultMatchup);
  const [columns, setColumns] = useState<MatchupStateData[][]>([]);
  const [rootMatchup, setRootMatchup] =
    useState<MatchupStateData>(defaultMatchupState);
  const { tournamentId, userId } = useParams<{
    tournamentId: string;
    userId: string;
  }>();
  const location = useLocation();
  const abortControllerRef = useRef<AbortController>();

  const calculateColumns = (
    b: BracketStateData
  ): [MatchupStateData[][], MatchupStateData] => {
    const c: MatchupStateData[][] = [];
    let roundNum = 1;
    let left = true;

    const r = b.matchups.find((m) => m.id === b.root_matchup_id);
    if (r === undefined) {
      return [[], defaultMatchupState];
    }

    while (roundNum > 0) {
      if (roundNum === r?.round) {
        left = false;
        roundNum -= 1;
        continue;
      }

      const matchups = b.matchups
        .filter(
          // eslint-disable-next-line no-loop-func
          (m) => m.round === roundNum && m.left_side === left
        )
        .sort((a, b) => a.id - b.id);
      c.push(matchups);

      roundNum = left ? roundNum + 1 : roundNum - 1;
    }

    return [c, r];
  };

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const loadBracket = async (signal: AbortSignal) => {
      setBracketData(defaultBracket);
      try {
        let b: BracketStateData = defaultBracket;
        const route = `/api/v1/tournament/${tournamentId}/bracket/${userId}`;
        const cachedData = resultCache.tryGet(route) as BracketStateData;
        if (cachedData) {
          b = cachedData;
        } else {
          const response = await getRequest(route);
          if (response.status !== 200) {
            return await handleResponseError(response);
          }

          const data = await response.json();
          b = data.data;
          resultCache.add(route, b);
        }

        const [c, r] = calculateColumns(b);
        setColumns(c);
        setRootMatchup(r);
        setBracketData(b);
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          console.log('Aborted');
          return;
        }
        throw e;
      }
    };

    loadBracket(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [location.pathname, tournamentId, userId]);

  const handleMakePredictionClicked = (matchUp: MatchupData) => {
    setPredictedMatchup(matchUp);
    setIsPredictionPopupOpen(true);
  };

  const handlePredictionMade = (bracketState: BracketStateData) => {
    const [c, r] = calculateColumns(bracketState);
    setColumns(c);
    setRootMatchup(r);
    setBracketData(bracketState);

    // Update cache so predictions are saved
    const route = `/api/v1/tournament/${tournamentId}/bracket/${userId}`;
    resultCache.add(route, bracketState);
  };

  return (
    <ArcherContainer
      strokeColor="#1e488b"
      noCurves={true}
      endMarker={false}
      style={{ height: '100%' }}
    >
      <div className={styles.bracketContainer}>
        <Loadable isLoading={bracketData.id === 0}>
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
        </Loadable>
      </div>
    </ArcherContainer>
  );
}
