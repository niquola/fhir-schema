sch = require(__dirname + '/../src/generation.js');
fs = require('fs');
yaml = require('js-yaml');

sch.settings.build = true;

var schema = sch.makeSchema(function(s){
    s.add(require(__dirname + '/../fhir/profiles-resources.json'))
    s.add(require(__dirname + '/../fhir/profiles-types.json'))
    return s;
});

delete schema.add

if(!fs.existsSync(__dirname + '/../build')){
  fs.mkdirSync(__dirname + '/../build');
}
fs.writeFileSync(__dirname + '/../build/fhir.schema.json', JSON.stringify(schema, null, " "))
fs.writeFileSync(__dirname + '/../build/fhir.schema.yaml', yaml.dump(schema))
