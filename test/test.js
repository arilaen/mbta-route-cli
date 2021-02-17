import assert from 'assert';
import { getConnectingIntermediateRoutes, stopsIncludeStop } from '../src/index';

describe('MBTA Routes CLI', function() {
  describe('stopsIncludeStop()', function() {
    it('should return true for Kendall if "Kendall/MIT" is in list', function() {
      assert.strictEqual(stopsIncludeStop([
        'Kendall/MIT', 'Ashmont'
      ], 'Kendall'), true);
    });
    it('should return true for MIT if "Kendall/MIT" is in list', function() {
      assert.strictEqual(stopsIncludeStop([
        'Kendall/MIT', 'Ashmont'
      ], 'MIT'), true);
    });
    it('should return false for MI if "Kendall / MIT" is in list', function() {
      assert.strictEqual(stopsIncludeStop([
        'Kendall/MIT', 'Ashmont'
      ], 'MI'), false);
    });
    it('should return false for Ken if "Kendall / MIT" is in list', function() {
      assert.strictEqual(stopsIncludeStop([
        'Kendall/MIT', 'Ashmont'
      ], 'Ken'), false);
    });
    it('should return true for "Kendall/MIT" if in list', function() {
      assert.strictEqual(stopsIncludeStop([
        'Kendall/MIT', 'Ashmont'
      ], 'Kendall/MIT'), true);
    });
    it('should return true for "Ashmont" if in list', function() {
      assert.strictEqual(stopsIncludeStop([
        'Kendall/MIT', 'Ashmont'
      ], 'Ashmont'), true);
    });
    it('should return false for Kendall if not in list or any stops', function() {
      assert.strictEqual(stopsIncludeStop([
        'Ashmont', 'Braintree'
      ], 'Kendall'), false);
    });
  });

  describe('getConnectingIntermediateRoutes()', function() {
    it('should return routes that have connecting stops and include the given stop, not including previous routes', function() {
        const result = getConnectingIntermediateRoutes({connectingStopsToRoutes: {
          Ashmont: [ 'Red', 'Mattapan Trolley' ],
          'Downtown Crossing': [ 'Red', 'Orange' ],
          'Park Street': [
            'Red',
            'B',
            'C',
            'D',
            'E'
          ],
          'Saint Paul Street': [ 'B', 'C' ],
          Kenmore: [ 'B', 'C', 'D' ],
          'Hynes Convention Center': [ 'B', 'C', 'D' ],
          Copley: [ 'B', 'C', 'D', 'E' ],
          Arlington: [ 'B', 'C', 'D', 'E' ],
          Boylston: [ 'B', 'C', 'D', 'E' ],
          Haymarket: [ 'Orange', 'C', 'E' ],
          'North Station': [ 'Orange', 'C', 'E' ],
          'Government Center': [ 'C', 'D', 'E', 'Blue' ],
          State: [ 'Orange', 'Blue' ]
        },
        previousRoutes: [ 'D' ],
        intRoute: 'E'
      });
      const expected = [
        'Red',
        'Blue',
        'B',
        'C',
        'Orange',
      ];
      console.log({result, expected});
      assert.strictEqual(result.length, expected.length);
      result.forEach(route => assert.strictEqual(expected.includes(route), true));
    });
  });
});