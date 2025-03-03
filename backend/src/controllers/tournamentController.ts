import { Request, Response } from 'express';
import prismaClient, {
  BracketStateData,
  MatchupStateData,
  NBATeam,
} from '@playoff-bracket-app/database';
import { BadRequestError } from '../errors/serverError';
import { createInviteToken, isNumberOfGamesValid } from '../utils/utils';
import { calculateUserScore } from '../utils/scoreCalculator';
import { Matchup, Prisma, Tournament } from '@prisma/client';

export async function createTournament(request: Request, response: Response) {
  const bracket = await prismaClient.bracket.findFirst({
    where: { id: request.body.bracketId },
  });

  if (!bracket) {
    throw new BadRequestError('Cannot create tournament, invalid bracket');
  }

  const userTournamentCount = await prismaClient.tournament.count({
    where: {
      users: {
        some: {
          id: request.user.id,
        },
      },
    },
  });

  const maxTournaments = Number(process.env.USER_MAX_TOURNAMENTS);
  if (userTournamentCount >= maxTournaments) {
    throw new BadRequestError(
      `User cannot be in more than ${maxTournaments} tournaments`
    );
  }

  const tournament = await prismaClient.tournament.create({
    data: {
      bracket_id: bracket.id,
    },
  });

  await prismaClient.user.update({
    where: {
      id: request.user.id,
    },
    data: {
      tournaments: {
        connect: {
          id: tournament.id,
        },
      },
    },
  });

  const memberData = [
    {
      id: request.user.id,
      nickname: request.user.nickname,
      score: 0,
    },
  ];

  response.status(200).json({
    success: true,
    message: 'Successfully created tournament',
    data: {
      tournamentId: tournament.id,
      bracketName: bracket.bracket_name,
      memberData: memberData,
    },
  });
}

export async function leaveTournament(request: Request, response: Response) {
  const tournamentId = Number.parseInt(request.params.id);
  if (Number.isNaN(tournamentId)) {
    throw new BadRequestError('Invalid tournament Id');
  }

  const tournament = await prismaClient.tournament.findFirst({
    where: {
      id: tournamentId,
    },
    include: {
      users: true,
    },
  });

  if (!tournament) {
    throw new BadRequestError('Could not find tournament with specified Id');
  }
  if (!tournament.users.some((user) => user.id === request.user.id)) {
    throw new BadRequestError('Cannot leave - user is not in tournament');
  }

  // This user is the last one. once they leave, clean up the tournament
  const tournamentRequiresDeletion: boolean = tournament.users.length === 1;

  await prismaClient.user.update({
    where: {
      id: request.user.id,
    },
    data: {
      tournaments: {
        disconnect: {
          id: tournament.id,
        },
      },
    },
  });

  if (tournamentRequiresDeletion) {
    await prismaClient.tournament.delete({
      where: {
        id: tournament.id,
      },
    });
  }

  response.status(200).json({
    success: true,
    message: 'Successfully left tournaments',
  });
}

export async function getInviteCodeInfo(request: Request, response: Response) {
  const code = request.params.code;
  const inviteToken = await prismaClient.inviteToken.findFirst({
    where: {
      code: code,
    },
    include: {
      sender: true,
    },
  });

  if (!inviteToken) {
    throw new BadRequestError('Invalid invite code');
  }

  if (inviteToken.sender_id === request.user.id) {
    throw new BadRequestError('You are the sender');
  }

  if (inviteToken.expiry <= new Date(Date.now())) {
    await prismaClient.inviteToken.delete({
      where: {
        id: {
          sender_id: inviteToken.sender_id,
          tournament_id: inviteToken.tournament_id,
        },
      },
    });
    throw new BadRequestError('Invite code expired!');
  }

  const tournament = await prismaClient.tournament.findFirst({
    where: {
      id: inviteToken.tournament_id,
    },
    include: { users: true, bracket: true },
  });

  if (!tournament) {
    throw new BadRequestError('Invalid invite code');
  }

  if (tournament.users.some((user) => user.id === request.user.id)) {
    throw new BadRequestError('User is already in this team');
  }

  response.status(200).json({
    success: true,
    data: {
      code: code,
      sender: inviteToken.sender.nickname,
      bracketName: tournament.bracket.bracket_name,
    },
  });
}

export async function joinTournament(request: Request, response: Response) {
  const code = request.params.code;
  const inviteToken = await prismaClient.inviteToken.findFirst({
    where: {
      code: code,
    },
  });

  if (!inviteToken) {
    throw new BadRequestError('Invalid invite code');
  }

  if (inviteToken.expiry <= new Date(Date.now())) {
    await prismaClient.inviteToken.delete({
      where: {
        id: {
          sender_id: inviteToken.sender_id,
          tournament_id: inviteToken.tournament_id,
        },
      },
    });
    throw new BadRequestError('Invite code expired!');
  }

  const tournament = await prismaClient.tournament.findFirst({
    where: {
      id: inviteToken.tournament_id,
    },
    include: {
      users: {
        include: {
          predictions: {
            include: {
              matchup: true,
            },
          },
        },
      },
      bracket: true,
    },
  });

  if (!tournament) {
    throw new BadRequestError('Invalid invite code');
  }

  if (tournament.users.some((user) => user.id === request.user.id)) {
    throw new BadRequestError('User is already in this team');
  }

  const userTournamentCount = await prismaClient.tournament.count({
    where: {
      users: {
        some: {
          id: request.user.id,
        },
      },
    },
  });

  const maxTournaments = Number(process.env.USER_MAX_TOURNAMENTS);
  if (userTournamentCount >= maxTournaments) {
    throw new BadRequestError(
      `User cannot be in more than ${maxTournaments} tournaments`
    );
  }

  await prismaClient.user.update({
    where: {
      id: request.user.id,
    },
    data: {
      tournaments: {
        connect: {
          id: tournament.id,
        },
      },
    },
  });

  const memberData = tournament.users.map((member) => {
    return { id: member.id, nickname: member.nickname };
  });

  memberData.push({
    id: request.user.id,
    nickname: request.user.nickname,
  });

  response.status(200).json({
    success: true,
    message: 'Successfully joined team',
    data: {
      tournamentId: tournament.id,
      bracketName: tournament.bracket.bracket_name,
      memberData: memberData,
    },
  });
}

export async function getTournamentDetails(
  request: Request,
  response: Response
) {
  const tournamentId = Number.parseInt(request.params.id);
  if (Number.isNaN(tournamentId)) {
    throw new BadRequestError('Invalid tournament Id');
  }

  const tournament = await prismaClient.tournament.findFirst({
    where: {
      id: tournamentId,
    },
    include: {
      users: {
        include: {
          predictions: {
            where: {
              tournament_id: tournamentId,
            },
            include: {
              matchup: true,
            },
          },
        },
      },
      bracket: {
        include: {
          matchups: true,
        },
      },
    },
  });

  if (
    !tournament ||
    !tournament.users.some((user) => user.id === request.user.id)
  ) {
    throw new BadRequestError(
      `User is not in tournament with id ${request.params.id}`
    );
  }

  const memberData = tournament.users.map((member) => {
    const userScore = calculateUserScore(member);
    return { id: member.id, nickname: member.nickname, score: userScore };
  });

  response.status(200).json({
    success: true,
    data: {
      tournamentId: tournament.id,
      bracketWithMatchups: tournament.bracket,
      memberData: memberData,
    },
  });
}

export async function getTournamentInviteCode(
  request: Request,
  response: Response
) {
  const tournamentId = Number.parseInt(request.params.id);
  if (Number.isNaN(tournamentId)) {
    throw new BadRequestError('Invalid tournament Id');
  }

  const tournament = await prismaClient.tournament.findFirst({
    where: { id: tournamentId },
    include: {
      users: true,
    },
  });

  if (
    !tournament ||
    !tournament.users.some((user) => user.id === request.user.id)
  ) {
    throw new BadRequestError(
      `User is not in tournament with id ${request.body.tournamentId}`
    );
  }

  const [code, expiry] = createInviteToken(
    request.user,
    tournament,
    Number(process.env.INVITE_TOKEN_TIME_TO_LIVE_MILLIS)
  );

  await prismaClient.inviteToken.upsert({
    where: {
      id: {
        sender_id: request.user.id,
        tournament_id: tournament.id,
      },
    },
    update: {
      expiry: expiry,
      code: code,
    },
    create: {
      tournament_id: tournament.id,
      sender_id: request.user.id,
      expiry: expiry,
      code: code,
    },
  });

  response.status(200).json({
    success: true,
    message: 'Generated invite token',
    data: `${process.env.INVITE_URL_BASE}/join/${code}`,
  });
}

type MatchupWithPrediction = Prisma.MatchupGetPayload<{
  include: { predictions: true };
}>;

async function getValidPredictions(
  userId: number,
  tournament: Tournament
): Promise<[MatchupWithPrediction[], MatchupWithPrediction[]]> {
  const matchups: MatchupWithPrediction[] = await prismaClient.matchup.findMany(
    {
      where: {
        bracket_id: tournament.bracket_id,
      },
      include: {
        predictions: {
          where: { user_id: userId, tournament_id: tournament.id },
        },
      },
    }
  );

  const finalMatchup = matchups.find((m) => m.advances_to === null);

  const hasPrediction = (matchup: MatchupWithPrediction) => {
    return matchup.predictions.length === 1;
  };

  const findValidPredictionRecursive = (
    validMatchups: Matchup[],
    matchup: MatchupWithPrediction
  ) => {
    if (matchup.round === 1) {
      if (!hasPrediction(matchup)) {
        validMatchups.push(matchup);
      }
      return;
    }

    const requisiteMatchups = matchups.filter(
      (m) => m.advances_to === matchup.id
    );
    if (requisiteMatchups.length !== 2) {
      throw new Error('Encountered invalid bracket');
    }

    if (
      !hasPrediction(matchup) &&
      hasPrediction(requisiteMatchups[0]) &&
      hasPrediction(requisiteMatchups[1])
    ) {
      validMatchups.push(matchup);
      return;
    }

    findValidPredictionRecursive(validMatchups, requisiteMatchups[0]);
    findValidPredictionRecursive(validMatchups, requisiteMatchups[1]);
  };

  const validMatchups = [];
  findValidPredictionRecursive(validMatchups, finalMatchup);
  return [matchups, validMatchups];
}

export async function makePrediction(request: Request, response: Response) {
  const matchupId: number = request.body.matchup;
  const predictedWinner = request.body.predictedWinner;
  const numberOfGames = request.body.numberOfGames;

  const tournamentId = Number.parseInt(request.params.id);
  if (Number.isNaN(tournamentId)) {
    throw new BadRequestError('Invalid tournament Id');
  }

  const tournament = await prismaClient.tournament.findFirst({
    where: { id: tournamentId },
    include: { bracket: true },
  });

  if (!tournament) {
    throw new BadRequestError(
      `User is not in tournament with id ${tournamentId}`
    );
  }

  if (tournament.bracket.predictions_locked) {
    throw new BadRequestError(
      'Can no longer make predictions for this tournament'
    );
  }

  const [matchups, validMatchups] = await getValidPredictions(
    request.user.id,
    tournament
  );
  const predictedMatchup = validMatchups.find((m) => m.id === matchupId);
  if (!predictedMatchup) {
    throw new BadRequestError('Invalid prediction');
  }

  let validTeam =
    predictedWinner === predictedMatchup.team_a ||
    predictedWinner === predictedMatchup.team_b;

  const parentPredictions = matchups.filter(
    (m) => m.advances_to === predictedMatchup.id
  );
  if (parentPredictions.length == 2) {
    if (parentPredictions[0].predictions.length > 0) {
      validTeam =
        validTeam ||
        predictedWinner === parentPredictions[0].predictions[0].winner;
    }
    if (parentPredictions[1].predictions.length > 0) {
      validTeam =
        validTeam ||
        predictedWinner === parentPredictions[1].predictions[0].winner;
    }
  }

  if (!validTeam) {
    throw new BadRequestError('Invalid team picked');
  }

  if (!isNumberOfGamesValid(numberOfGames, predictedMatchup.best_of)) {
    throw new BadRequestError('Invalid number of games picked');
  }

  await prismaClient.prediction.create({
    data: {
      user_id: request.user.id,
      bracket_id: tournament.bracket_id,
      matchup_id: matchupId,
      tournament_id: tournament.id,
      winner: predictedWinner,
      number_of_games: numberOfGames,
    },
  });

  const [matchupData, finalsMatchupId] = await getBracketStateResponse(
    request.user.id,
    tournament,
    true
  );

  response.status(200).json({
    success: true,
    message: 'Successfully made prediction',
    data: {
      matchups: matchupData,
      root_matchup_id: finalsMatchupId,
    },
  });
}

export async function getBracketStateForUser(
  request: Request,
  response: Response
) {
  const tournamentId = Number.parseInt(request.params.id);
  if (Number.isNaN(tournamentId)) {
    throw new BadRequestError('Invalid tournament Id');
  }

  const tournament = await prismaClient.tournament.findFirst({
    where: { id: tournamentId },
    include: {
      bracket: true,
      users: true,
    },
  });

  if (!tournament) {
    throw new BadRequestError(
      `User is not in tournament with id ${tournamentId}`
    );
  }

  const userId = Number.parseInt(request.params.user);
  if (!tournament.users.some((user) => user.id === userId)) {
    throw new BadRequestError(
      `User with id ${userId} is not in your tournament`
    );
  }

  const [matchupData, finalsMatchupId] = await getBracketStateResponse(
    userId,
    tournament,
    userId === request.user.id
  );

  const bracketState: BracketStateData = {
    ...tournament.bracket,
    matchups: matchupData,
    root_matchup_id: finalsMatchupId,
  };

  response.status(200).json({
    success: true,
    data: bracketState,
  });
}

async function getBracketStateResponse(
  userId: number,
  tournament: Tournament,
  includePredictions
): Promise<[MatchupStateData[], number]> {
  const matchups = await prismaClient.matchup.findMany({
    where: { bracket_id: tournament.bracket_id },
    include: {
      predictions: {
        where: {
          user_id: userId,
          tournament_id: tournament.id,
        },
      },
    },
  });

  let validMatchups = [];
  let allMatchups = [];
  if (includePredictions) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [allMatchups, validMatchups] = await getValidPredictions(
      userId,
      tournament
    );
  }

  const matchupData = matchups.map((matchup) => {
    const parentMatchups = matchups.filter(
      (match) => match.advances_to === matchup.id
    );

    const requiresPrediction =
      includePredictions && validMatchups.some((p) => p.id === matchup.id);

    const result: MatchupStateData = {
      id: matchup.id,
      round: matchup.round,
      left_side: matchup.left_side,
      team_a: (matchup.team_a ?? parentMatchups[0].predictions[0]?.winner) as
        | NBATeam
        | undefined,
      team_b: (matchup.team_b ?? parentMatchups[1].predictions[0]?.winner) as
        | NBATeam
        | undefined,
      best_of: matchup.best_of,
      team_a_wins: matchup.team_a_wins,
      team_b_wins: matchup.team_b_wins,
      requires_prediction: requiresPrediction,
      advances_to: matchup.advances_to,
    };
    if (matchup.predictions.length > 0) {
      result.predictedWinner = matchup.predictions[0].winner as NBATeam;
      result.number_of_games = matchup.predictions[0].number_of_games;
    }
    if (matchup.winner !== null) {
      result.winner = matchup.winner as NBATeam;
    }

    return result;
  });

  const finalsMatchup = matchups.find((matchup) => matchup.advances_to == null);
  return [matchupData, finalsMatchup.id];
}
