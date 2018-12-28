# feathers-memory-geolocation

Service adapter that extends [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory) and add geolocation support with [geokdbush](https://github.com/mourner/geokdbush).

```bash
$ npm install --save feathers-memory-geolocation
```

## API

### `service([options])`

Returns a new service instance initialized with the given options. For more information see [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory#api)

```js
const service = require('feathers-memory-geolocation');

const store = [
    { id:1, name:'New York', lat:40.716655, lon:-74.002958},
    { id:2, name:'San Francisco', lat:37.773391, lon:-122.419726},
    ....
]

app.use('/locations', service( store ));
```

## Example

Here is an example of a Feathers server with a `locations` in-memory geolocation with data from [all-the-cities](https://github.com/zeke/all-the-cities)

```
$ npm install @feathersjs/feathers @feathersjs/express @feathersjs/socketio @feathersjs/errors feathers-memory-geolocation all-the-cities
```

In `app.js`:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const geolocation = require('feathers-memory-geolocation');

const cities = require("all-the-cities")

// Create an Express compatible Feathers application instance.
const app = express(feathers());
// Turn on JSON parser for REST services
app.use(express.json());
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Enable REST services
app.configure(express.rest());
// Enable REST services
app.configure(socketio());
// Create an geolocation service
app.use('/locations', geolocation({
  store: cities,
  paginate: {
    default: 20,
    max: 20
  }
}));
// Set up default error handler
app.use(express.errorHandler());

// Start the server.
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`)
});
```

Run the example with `node app` and go to [http://localhost:3030/locations?$nearby[$lat]=40.716655&$nearby[$lon]=-74.002958&$nearby[$maxDistance]=100](http://localhost:3030/locations?$nearby[$lat]=40.716655&$nearby[$lon]=-74.002958&$nearby[$maxDistance]=100).

You can also use Featherjs common [querying](https://docs.feathersjs.com/api/databases/querying).

```js
app.service('locations').find({
  query: {
    $nearby: {
      $lat: 40.716655,
      $lon: -74.002958,
      $maxDistance: 100
    },
    population: {
      $gt: 100000
    }
  }
})
```
