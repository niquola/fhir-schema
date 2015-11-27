assert = require('assert');
sch = require('../src/generation');
utils = require('../src/utils');
helpers = require('./helpers');

var tests = helpers.loadYaml('./elements-test.yaml');
fs = require('fs')
describe('conversion', function () {
    tests.forEach(function(test){
        it(JSON.stringify(test.element), function () {
            res  = sch.element2schema(test.element);
            test.result = res
            assert.deepEqual(res, test.result);
        });
    });
});
