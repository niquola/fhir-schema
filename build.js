sch = require('./src/schema.js');
fs = require('fs');

sch.settings.build = true;

function generateSchema(s){
    var profiles = require('./fhir/profiles-resources.json')
    var types = require('./fhir/profiles-types.json')
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

fs.writeFileSync('./src/fhir.schema.json', JSON.stringify(schema))
