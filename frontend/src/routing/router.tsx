import Root from '../pages/root/Root';
import Login from '../pages/login/Login';
import Error from '../pages/error/Error';
import Register from '../pages/register/Register';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home/Home';
import Tournament from '../pages/tournament/Tournament';
import { bracketLoader } from '../utils/loaders';
import Bracket from '../pages/bracket/Bracket';
import NoneSelected from '../pages/home/NoneSelected';
import TournamentError from '../pages/error/TournamentError';
import CreateTournamentPopup from '../components/popups/createTournamentPopup/CreateTournamentPopup';
import GetInviteCodePopup from '../components/popups/getInviteCodePopup/GetInviteCodePopup';
import LeaveTournamentPopup from '../components/popups/leaveTournamentPopup/LeaveTournamentPopup';
import JoinTournamentPopup from '../components/popups/joinTournamentPopup/JoinTournamentPopup';

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <Error />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/',
        element: <Home />,
        children: [
          {
            errorElement: <TournamentError />,
            children: [
              {
                index: true,
                element: <NoneSelected />,
              },
              {
                path: '/tournament/:tournamentId',
                element: <Tournament />,
                children: [
                  {
                    path: '/tournament/:tournamentId/:userId',
                    element: <Bracket />,
                    loader: bracketLoader,
                  },
                  {
                    path: '/tournament/:tournamentId/invite',
                    element: <GetInviteCodePopup />,
                  },
                  {
                    path: '/tournament/:tournamentId/leave',
                    element: <LeaveTournamentPopup />,
                  },
                ],
              },
              {
                path: '/create',
                element: <CreateTournamentPopup />,
              },
              {
                path: '/join/:inviteCode',
                element: <JoinTournamentPopup />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
