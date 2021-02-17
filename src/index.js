import chalk from 'chalk';
import {getFilterQueryParam, getSubwayRoutes, getStops} from './api';
import { FILTERS } from './types';

// Question 1: Print all light rail and heavy rail lines with filtered dat
// Helper method with output route {id: name}[]
const getRouteIdsToNames = async () => {
  const routesData = await getSubwayRoutes();
  return routesData.reduce((acc, route) => {
    acc[route.id] = route.attributes.long_name;
    return acc;
  }, {});
}

export const findSubwayLines = async () => {
  console.log('At find subway lines');
  try {
    const routeIdsToNames = await getRouteIdsToNames();
    console.log(chalk.green(Object.values(routeIdsToNames).join(', ')));
    return routeIdsToNames;
  } catch (e) {
    console.error(`An error has occurred: ${e}`);
  }
}

// Question 2: Update solution to show subway routes with most stops,
// least stops, and list of connecting stations
export const findRailStopInfo = async (cachedRouteIdsToNames) => {
  try {
    let routeIdsToNames;
    if (cachedRouteIdsToNames) {
      routeIdsToNames = cachedRouteIdsToNames;
    }
    else {
      console.log('Fetching route names and ids...');
      routeIdsToNames = await getRouteIdsToNames();
    }

    const routeIds = Object.keys(routeIdsToNames);

    const stopResultsGroupedByRouteId = await Promise.all(routeIds.map(routeId => {
      return getStops(
        `${getFilterQueryParam(FILTERS.ROUTE, [routeId])}&include=route`)
    }));
      
    const routesToStops = routeIds.reduce((acc, id) => {
      acc[id] = [];
      return acc;
    }, {});
    
    stopResultsGroupedByRouteId.forEach((stops) => {
      stops.forEach((stop) => {
        const routeData = stop.relationships.route.data;
        if (!!routeData) {
          const routeId = stop.relationships.route.data.id;
          const stopName = stop.attributes.name;
          if (routesToStops[routeId]) routesToStops[routeId].push(stopName);
        }
        // This should not happen
        // else routesToStops[routeId] = [stopName];
      });
    });

    const {mostStopsRoutes, leastStopsRoutes, mostStops, leastStops, connectingStopsToRoutes} =
      Object.entries(routesToStops).reduce((acc, cur) => {
        const [routeId, stops] = cur;
        const routeName = routeIdsToNames[routeId];
        const numStops = stops.length;
        if (numStops === acc.mostStops) {
          acc.mostStopsRoutes.push(routeName);
        }
        else if (numStops > acc.mostStops) {
          acc.mostStopsRoutes = [routeName];
          acc.mostStops = numStops;
        }

        if (numStops === acc.leastStops) {
          acc.leastStopsRoutes.push(routeName);
        } else if (numStops < acc.leastStops || acc.leastStops === undefined) {
          acc.leastStopsRoutes = [routeName];
          acc.leastStops = numStops;
        }

        stops.forEach(stop => {
          if (acc.allStopsToRoutes[stop]) {
            acc.allStopsToRoutes[stop].push(routeName);
            acc.connectingStopsToRoutes[stop] = acc.allStopsToRoutes[stop];
          } else {
            acc.allStopsToRoutes[stop] = [routeName];
          }
        });
        return acc;
      }, {
        mostStopsRoutes: [],
        leastStopsRoutes: [],
        mostStops: 0,
        leastStops: undefined,
        allStopsToRoutes: {}, // will be {stop: [routeNames]}
        connectingStopsToRoutes: {}
      });
    const formatConnectingStopsToRoutes = () => {
      return Object.entries(connectingStopsToRoutes).map(([stop, routeNames]) =>
        `${stop} (${routeNames.join(', ')})`
      ).join('\n');
    }
    console.log(chalk.green(`
Route(s) with most stops: ${mostStopsRoutes.join(', ')} (${mostStops} stops)
Route(s) with least stops: ${leastStopsRoutes.join(', ')} (${leastStops} stops)
Connecting stops: \n${formatConnectingStopsToRoutes()}`));
    return {routeIdsToNames, routesToStops, connectingStopsToRoutes};
  } catch (e) {
    console.error(`An error has occurred: ${e}`);
  }
}

// Function to allow Kendall to be recognized as a stop (Kendall/MIT is the real stop)
// Good first candidate for unit test
export const stopsIncludeStop = (stops, stop) => {
  return stops.some(s => s === stop ||
    (s.includes('/') && !stop.includes('/')) &&
    s.split('/').some(part => part.trim() === stop));
}

export const getConnectingIntermediateRoutes = ({connectingStopsToRoutes, previousRoutes, intRoute}) => {
  return Object.values(connectingStopsToRoutes).reduce((acc, routes) => {
    if (!routes.includes(intRoute)) return acc;
    return acc.concat(routes.filter(route => !acc.includes(route) && !previousRoutes.includes(route) && route !== intRoute));
  }, []);
}

// Use user inputted two stops to find lines that can get them from one to the other
export const findConnectingLines = async ({firstStop, lastStop, blockedRouteNames}, cachedData) => {
  let routeIdsToNames;
  let routesToStops;
  let connectingStopsToRoutes;
  if (cachedData) {
    routeIdsToNames = cachedData.routeIdsToNames;
    routesToStops = cachedData.routesToStops;
    connectingStopsToRoutes = cachedData.connectingStopsToRoutes;
  } else {
    throw new Error("Cannot run find connecting lines standalone yet");
  }
  connectingStopsToRoutes = Object.entries(connectingStopsToRoutes).reduce((acc, cur) => {
    const [stop, routes] = cur;
    acc[stop] = routes.filter(route => !blockedRouteNames.includes(route));
    return acc;
  }, {});
  routesToStops = Object.entries(routesToStops).filter(([k,v]) => {
    return !blockedRouteNames.some(name => routeIdsToNames[k] === name);
  }).reduce((acc, cur) => {
    const [k, v] = cur;
    acc[k] = v;
    return acc;
  }, {});
  // Find route between, connecting if necessary
  const {routesWithFirstStop, routesWithLastStop, sameRouteId} = Object.entries(routesToStops).reduce((acc, cur) => {
    const [routeId, stops] = cur;
    const hasFirstStop = stopsIncludeStop(stops, firstStop);
    const hasLastStop = stopsIncludeStop(stops, lastStop);
    if (hasFirstStop) acc.routesWithFirstStop.push(routeId);
    if (hasLastStop) acc.routesWithLastStop.push(routeId);
    if (hasFirstStop && hasLastStop) acc.sameRouteId = routeId;
    return acc;
  }, {routesWithFirstStop: [], routesWithLastStop: [], sameRouteId: undefined});
  if (sameRouteId) { // Easy path
    console.log(chalk.green(`${firstStop} to ${lastStop} -> ${routeIdsToNames[sameRouteId]}`));
    return;
  }
  // Hard path - connect
  let routeNames = undefined;
  const routeNamesWithLastStop = routesWithLastStop.map(r => routeIdsToNames[r]);
  for (let routeId of routesWithFirstStop) {
    if (routeNames) break;
    const findConnectingRoutesRecursive = (previousRoutes, connectingRoutesArg, stop) => {
      const connectingRoutes = connectingRoutesArg || connectingStopsToRoutes[stop];
      if (connectingRoutes) {
        const connectingRouteToLastStop = connectingRoutes.find(cr => routeNamesWithLastStop.includes(cr));
        if (connectingRouteToLastStop) {
          // we're done!
          return [...previousRoutes, connectingRouteToLastStop];
        } else { // Connects but not to last stop
          // Keep track of routes that haven't been used up yet
          const intermediateRoutes = connectingRoutes.filter(r => !previousRoutes.includes(r));
          let loopResult;
          for (let intRoute of intermediateRoutes) {
            const connectingIntermediateRoutes = getConnectingIntermediateRoutes({
              connectingStopsToRoutes: connectingStopsToRoutes, previousRoutes, intRoute});
            loopResult = findConnectingRoutesRecursive([...previousRoutes, intRoute], connectingIntermediateRoutes);
            if (loopResult) break;
          }
          return loopResult;
        }
      } else { // No luck yet
        return undefined;
      }
    }
    for (let stop of routesToStops[routeId]) {
      if (stop === firstStop) continue;
      routeNames = findConnectingRoutesRecursive([routeIdsToNames[routeId]], undefined, stop);
      if (routeNames) break;
    }
  }
  console.log(`${firstStop} to ${lastStop} -> ${routeNames ? routeNames.join(', ') : 'No routes found.'}`);
}
