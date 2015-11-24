assert = require('assert')
sch = require('../src/schema.js');

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
    var profiles = require('../fhir/profiles-resources.json')
    var types = require('../fhir/profiles-types.json')
    return (profiles.entry.concat(types.entry)).reduce(function(acc, entry){
        if(entry.resource.resourceType == 'StructureDefinition') {
            return sch.addToSchema(acc, entry.resource);
        } else {
            return acc;
        }
    }, s);
}

fs = require('fs')

var schema = sch.buildSchema(function(s){
   return generateSchema(s);
});

fs.writeFileSync('/tmp/fhir.schema.json', JSON.stringify(schema, null, "  "))

// console.log('SCHEMA',
//             JSON.stringify(
//                 schema.definitions.Patient
//                 , null, "  "))


var data = {
    resourceType: "Patient",
    name: [{given: ['dups']}],
    birthDate: '1980',
    gender: 'memale'
}


console.log(
    JSON.stringify(
        schema.validate(data)
    )
);

var items = fs.readdirSync(__dirname + '/../tmp/')
for (var i=0; i<items.length; i++) {
    var file = items[i];
    if(file.indexOf('.json') > -1){
        var resource = JSON.parse(fs.readFileSync(__dirname + '/../tmp/' + file))
        console.log(resource.resourceType, 'from', file)
        var result = schema.validate(resource)
        console.log(result.error.message)
        console.log(JSON.stringify([result.error.dataPath, result.error.schemaPath]))
        console.log('---')
    }
}
