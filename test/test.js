import assert from 'assert';
import { stopsIncludeStop } from '../src/index';

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
});