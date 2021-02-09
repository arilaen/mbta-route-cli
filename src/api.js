import https from 'https';
import {FILTERS, ROUTE_TYPE} from './types';

const ROUTE = {
  ROUTES: 'routes',
  STOPS: 'stops'
}

const get = async (route, queryString) => new Promise((resolve, reject) => {
  const options = {
    host: 'api-v3.mbta.com',
    path: `/${route}?${queryString}&api_key=${process.env.API_KEY}`,
  };
  // console.log({path: options.path});
  https.get(options, (res) => {
    // Adapted/simplified from https://nodejs.org/api/http.html#http_http_get_url_options_callback
    const { statusCode } = res;
    if (statusCode !== 200) {
      res.resume(); // Free up memory
      return;
    }
    res.setEncoding('utf-8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        resolve(parsedData.data);
      } catch (e) {
        console.error(e.message);
        reject(e);
      }
    });
  }).on('connect', () => {console.log('connected!')}).on('error', (err) => {
    console.error(err.message);
    reject(err);
  });
});

export const getFilterQueryParam = (filter, values) => {
  return `filter[${filter}]=${values.join(',')}`;
}

const getRoutes = async (queryString) => {
  return await get(ROUTE.ROUTES, queryString);
}

// Will be dealing with filtered data only - sending less data across the wire will be faster
// and generally the server can filter more quickly than my NodeJS client can,
// which would work in ~O(n) time to O(n) * O(log(n)) depending on the length of the array.
// With filtered data I know each line will only appear once as well so can write an O(n) function.
// In addition in this case the total data size is ~50 times the filtered data size,
// so the difference is significant.
export const getSubwayRoutes = async () => {
  return await getRoutes(getFilterQueryParam(FILTERS.ROUTE_TYPE,
    [ROUTE_TYPE.HEAVY_RAIL, ROUTE_TYPE.LIGHT_RAIL]));
}

export const getStops = async (queryString) => {
  return await get(ROUTE.STOPS, queryString);
}
