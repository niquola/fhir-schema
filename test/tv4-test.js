var assert = require('assert');
var sch = require('../src/tv4');
var utils = require('../src/utils');
var helpers = require('./helpers');

var schema = sch.makeSchema(function(s){
    var profiles = require(helpers.FHIR_DIR + 'profiles-resources.json');
    var types = require(helpers.FHIR_DIR + 'profiles-types.json');
    s.add(profiles);
    s.add(types);
    return s;
});

console.log('HERE', schema.validate({resourceType: "Patient", "fo": "bar", birthDate: '111'}));

describe('conversion', function () {
    var errors = 0;
    var done = 0;
    var limit = null;
    helpers.eachSample({limit: limit, skip_list: ['canonical', 'questionnaire', 'testscript']}, function(resource, file){
        it(file, function () {
            var result = schema.validate(resource);
            done++;
            if(!result.valid) {
                errors++;
                console.log(resource.resourceType, 'from', file);
                console.log('===============');
                console.log(JSON.stringify(result, null, " "));
                console.log("");
            }
            assert(result.valid);
        });

    });

    after(function(){
        console.log("PROCESSED: ", done);
        console.log("ERRORS: ", errors);
        console.log("");
    });
});
