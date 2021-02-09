MBTA Route CLI

# Install

```
npm i
npm link # Makes mroute available as CLI command
```

[Get an MBTA API Key](https://api-v3.mbta.com/) and set API_KEY in your environment or prefix your CLI commands with API_KEY=X.

## Usage

```
API_KEY={yourKey} mroute # Returns route names, info, and route finder between stops

API_KEY={yourKey} mroute names # Returns route names
API_KEY={yourKey} mroute stop-info # Returns stop info (route with most stops, least stops, connecting stops)
API_KEY={yourKey} mroute connect # Returns a set of lines that connect two stops
```

## Test

```
npm run test # Just one simple test for now
```

## Future Potential Improvements

- Add more unit tests with Mocha
- Possibly add json-server for providing test data
- Use typescript to represent schemas, etc.
