import hawks from '../assets/teamLogos/hawks.png';
import celtics from '../assets/teamLogos/celtics.png';
import nets from '../assets/teamLogos/nets.png';
import hornets from '../assets/teamLogos/hornets.png';
import bulls from '../assets/teamLogos/bulls.png';
import cavaliers from '../assets/teamLogos/cavaliers.png';
import mavericks from '../assets/teamLogos/mavericks.png';
import nuggets from '../assets/teamLogos/nuggets.png';
import pistons from '../assets/teamLogos/pistons.png';
import warriors from '../assets/teamLogos/warriors.png';
import rockets from '../assets/teamLogos/rockets.png';
import pacers from '../assets/teamLogos/pacers.png';
import clippers from '../assets/teamLogos/clippers.png';
import lakers from '../assets/teamLogos/lakers.png';
import grizzlies from '../assets/teamLogos/grizzlies.png';
import heat from '../assets/teamLogos/heat.png';
import bucks from '../assets/teamLogos/bucks.png';
import timberwolves from '../assets/teamLogos/timberwolves.png';
import pelicans from '../assets/teamLogos/pelicans.png';
import knicks from '../assets/teamLogos/knicks.png';
import thunder from '../assets/teamLogos/thunder.png';
import magic from '../assets/teamLogos/magic.png';
import sixers from '../assets/teamLogos/76ers.png';
import suns from '../assets/teamLogos/suns.png';
import blazers from '../assets/teamLogos/trailblazers.png';
import kings from '../assets/teamLogos/kings.png';
import spurs from '../assets/teamLogos/spurs.png';
import raptors from '../assets/teamLogos/raptors.png';
import jazz from '../assets/teamLogos/jazz.png';
import wizards from '../assets/teamLogos/wizards.png';
import unknown from '../assets/playoffs.png';
import { NBATeam } from '@playoff-bracket-app/database';

const logos: Record<NBATeam | 'Unknown', string> = {
  Hawks: hawks,
  Celtics: celtics,
  Nets: nets,
  Hornets: hornets,
  Bulls: bulls,
  Cavaliers: cavaliers,
  Mavericks: mavericks,
  Nuggets: nuggets,
  Pistons: pistons,
  Warriors: warriors,
  Rockets: rockets,
  Pacers: pacers,
  Clippers: clippers,
  Lakers: lakers,
  Grizzlies: grizzlies,
  Heat: heat,
  Bucks: bucks,
  Timberwolves: timberwolves,
  Pelicans: pelicans,
  Knicks: knicks,
  Thunder: thunder,
  Magic: magic,
  Sixers: sixers,
  Suns: suns,
  Blazers: blazers,
  Kings: kings,
  Spurs: spurs,
  Raptors: raptors,
  Jazz: jazz,
  Wizards: wizards,
  Unknown: unknown,
};

export default logos;
