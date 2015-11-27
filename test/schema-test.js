assert = require('assert')
sch = require('../src/schema.js');
utils = require('../src/utils.js');

fs = require('fs')
yaml = require('js-yaml')

function loadYaml (pth){
   return yaml.safeLoad(fs.readFileSync(__dirname +'/' + pth, "utf8"));
}

var tests = loadYaml('./elements-test.yaml')

// describe('conversion', function () {
//     tests.forEach(function(test){
//         it(JSON.stringify(test.element), function () {
//             res  = sch.element2schema(test.element);
//             assert.deepEqual(res, test.result);
//         })
//     })
// })



function generateSchema(s){
    var profiles = require(__dirname + '/../fhir/profiles-resources.json')
    var types = require(__dirname + '/../fhir/profiles-types.json')
    return (profiles.entry.concat(types.entry)).reduce(function(acc, entry){
        if(entry.resource.resourceType == 'StructureDefinition') {
            return sch.addToSchema(acc, entry.resource);
        } else {
            return acc;
        }
    }, s);
}


var schema = sch.buildSchema(function(s){
   return generateSchema(s);
});

fs.writeFileSync('/tmp/fhir.schema.json', JSON.stringify(schema, null, "  "))

function jlog(x){console.log(JSON.stringify(x,null,"  "))}

var data = {
    resourceType: "Patient",
    name: [{given: ['dups']}],
    fo: 3,
    birthDate: '1980',
    gender: 'memale'
}

jlog(schema.validate(data));

var SKIP_LIST = [
    // 'canonical',
    // 'questionnaire',
    // 'testscript'
]

describe('conversion', function () {
    var items = fs.readdirSync(__dirname + '/../tmp/')
    var errors = 0;
    var done = 0;
    var limit = items.length
    limit = 10;
    for (var i=0; i < limit; i++) {
        var file = items[i];
        it(file, function () {
        var skip = SKIP_LIST.some(function(x){ return file.indexOf(x) > -1 })
        if(file.match(/json$/) && !skip){
            var resource = JSON.parse(fs.readFileSync(__dirname + '/../tmp/' + file))
            var result = schema.validate(resource)
            done++;
            if(!result.valid) {
                console.log(resource.resourceType, 'from', file)
                console.log('===============')
                result.errors.forEach(function(err){
                    var path = err.dataPath.replace(']','').replace('[','.').split('.').splice(1);
                    console.log('VALUE: ', JSON.stringify(utils.getIn(resource, path)))
                })
                errors++;
                console.log(JSON.stringify(result, null, " "))
                console.log("")
            }
            // assert(!result.error)
        }
        })
    }

    after(function(){
        console.log("PROCESSED: ", done)
        console.log("ERRORS: ", errors)
        console.log("")
        
    })
})
