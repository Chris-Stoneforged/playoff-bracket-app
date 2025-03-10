import TournamentList from '../../components/tournamentList/TournamentList';
import React, { useContext, useEffect, useState } from 'react';
import styles from './Home.module.css';
import { tournamentContext, userContext } from '../../utils/context';
import { Outlet, useNavigate } from 'react-router-dom';
import { TournamentData, UserData } from '@playoff-bracket-app/database';
import { TournamentChangeType } from '../../utils/types';
import Loadable from '../../components/loadable/Loadable';

export default function Home() {
  const navigate = useNavigate();
  const user: UserData = useContext(userContext);
  const [tournaments, setTournaments] = useState<TournamentData[]>([]);

  useEffect(() => {
    if (user?.tournaments) {
      setTournaments(user.tournaments);
    }
  }, [user]);

  const handleTournamentChanged = (
    tournament: TournamentData,
    changeType: TournamentChangeType
  ) => {
    switch (changeType) {
      case 'Added': {
        setTournaments([...tournaments, tournament]);
        navigate(`/tournament/${tournament.tournamentId}/${user.userId}`);
        break;
      }
      case 'Removed': {
        setTournaments(
          tournaments.filter((t) => t.tournamentId !== tournament.tournamentId)
        );
        navigate('/');
        break;
      }
      case 'Selected': {
        navigate(`/tournament/${tournament.tournamentId}/${user.userId}`);
        break;
      }
    }
  };

  return (
    <Loadable isLoading={user.userId < 0}>
      <div className={styles.main}>
        <tournamentContext.Provider value={handleTournamentChanged}>
          <TournamentList tournaments={tournaments} />
          <Outlet />
        </tournamentContext.Provider>
      </div>
    </Loadable>
  );
}
