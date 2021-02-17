import arg from 'arg';
import chalk from 'chalk';
import inquirer from 'inquirer';
import {findRailStopInfo, findSubwayLines, findConnectingLines} from './index';

const FIND_RAIL_ROUTE_NAMES = 'names';
const FIND_RAIL_STOP_INFO = 'stop-info';
const FIND_CONNECTING_LINES = 'connect';
// List tasks
const HELP = 'help';

const allNonHelpTasks = [FIND_RAIL_ROUTE_NAMES, FIND_RAIL_STOP_INFO, FIND_CONNECTING_LINES];
  
export async function cli(args) {
  if (!process.env.API_KEY) {
    console.log(chalk.red('Cannot execute: API_KEY environment variable is required (i.e. API_KEY={yourKey} mroute)'));
    return;
  }
  let options = parseArgumentsIntoOptions(args);
  if (!options.task) {
    chalk.green('All tasks running in sequence; run `mroute help` to see individual tasks.');
    const routeNamesAndIds = await findSubwayLines();
    const railStopInfo = await findRailStopInfo(routeNamesAndIds);
    await promptAndFindConnectingLines(railStopInfo);
    return;
  }
  switch (options.task) {
    case FIND_RAIL_ROUTE_NAMES:
      return await findSubwayLines();
    case FIND_RAIL_STOP_INFO:
      return await findRailStopInfo();
    case FIND_CONNECTING_LINES:
      return await findConnectingLines();
    case HELP:
    default:
      console.log(chalk.green('Available tasks:'));
      allNonHelpTasks.forEach(task => {
        console.log(`   ${chalk.yellow(task)}`);
      });
      return;
  }
}

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {},
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    task: args._[0],
  };
}

const promptAndFindConnectingLines = async (railStopInfo) => {
  const questions = [
    {
      type: 'input',
      name: 'firstStop',
      message: 'Which station do you want to depart from?',
    },
    {
      type: 'input',
      name: 'lastStop',
      message: 'Which station are you going to?',
    },
    {
      type: 'input',
      name: 'blockedRouteNamesString',
      message: 'Are any routes unavailable? (i.e. Red Line, Blue Line)',
    },
  ];
  const {firstStop, lastStop, blockedRouteNamesString} = await inquirer.prompt(questions);
  let blockedRouteNames;
  if (!blockedRouteNamesString) blockedRouteNames = [];
  else blockedRouteNames = blockedRouteNamesString.split(',').map(n => n.trim());
  if (!firstStop || !lastStop) throw new Error('Both stops are required to find connecting lines.');
  return await findConnectingLines({firstStop, lastStop, blockedRouteNames}, railStopInfo);
}
