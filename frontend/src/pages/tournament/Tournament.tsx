import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Tournament.module.css';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { userContext, tournamentIdContext } from '../../utils/context';
import TournamentSettingsMenu from '../../components/tournamentSettingsMenu/TournamentSettingsMenu';
import {
  TournamentMemberData,
  TournamentWithBracketData,
  UserData,
} from '@playoff-bracket-app/database';
import background from '../../assets/background.webp';
import handleResponseError from '../../utils/errorHandling';
import { getRequest } from '../../utils/routes';
import Loadable from '../../components/loadable/Loadable';
import resultCache from '../../utils/cache';

export default function Tournament() {
  const navigate = useNavigate();
  const user: UserData = useContext(userContext);
  const { tournamentId, userId } = useParams<{
    tournamentId: string;
    userId: string;
  }>();
  const selectedMemberId: number = userId ? Number.parseInt(userId) : -1;
  const [tournamentData, setTournamentData] =
    useState<TournamentWithBracketData | null>(null);
  const location = useLocation();
  const abortControllerRef = useRef<AbortController>();

  const handleMemberClicked = (memberId: number) => {
    if (tournamentData !== null) {
      navigate(`/tournament/${tournamentId}/${memberId}`);
    }
  };

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const loadTournament = async (signal: AbortSignal) => {
      const route = `/api/v1/tournament/${tournamentId}`;
      const cachedData = resultCache.tryGet(route) as TournamentWithBracketData;
      if (cachedData) {
        setTournamentData(cachedData);
        return;
      }

      try {
        const response = await getRequest(route, signal);
        if (response.status !== 200) {
          return await handleResponseError(response);
        }

        const data = await response.json();
        resultCache.add(route, data.data);
        setTournamentData(data.data);
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          console.log('Aborted');
          return;
        }
        throw e;
      }
    };

    loadTournament(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [location.pathname, tournamentId]);

  // Set user as the first member in the list
  let memberData: TournamentMemberData[] = [];
  if (tournamentData !== null) {
    memberData = [...tournamentData.memberData];
    const meIndex = memberData.findIndex((m) => m.id === user?.userId);
    const [me] = memberData.splice(meIndex, 1);
    memberData.unshift(me);
  }

  const isOver = tournamentData?.bracketWithMatchups.matchups.every(
    (m) => m.winner
  );
  const highestScore = tournamentData?.memberData.reduce((prev, curr) =>
    curr.score > prev.score ? curr : prev
  );

  return (
    <div className={styles.tournamentZone}>
      <img alt="" src={background} className={styles.background} />
      <tournamentIdContext.Provider value={tournamentData?.tournamentId ?? -1}>
        <Outlet />
      </tournamentIdContext.Provider>
      <Loadable isLoading={tournamentData === null}>
        <div className={styles.memberList}>
          {memberData.map((member) => (
            <button
              className={`${styles.memberButton} ${
                member.id === selectedMemberId ? styles.selected : ''
              }`}
              onClick={() => handleMemberClicked(member.id)}
            >
              {member.id === user?.userId ? 'Me' : member.nickname}
              <text
                className={styles.scoreText}
              >{`Score: ${member.score}`}</text>
            </button>
          ))}
        </div>
        <TournamentSettingsMenu />
        {isOver && (
          <text className={styles.winnerText}>
            Winner: <b>{highestScore?.nickname ?? ''}</b>!
          </text>
        )}
      </Loadable>
    </div>
  );
}
