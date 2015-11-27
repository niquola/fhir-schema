fs = require('fs');
yaml = require('js-yaml');

exports.loadYaml = function(pth){
    return yaml.safeLoad(fs.readFileSync(__dirname +'/' + pth, "utf8"));
};

exports.toYaml = function(obj){
    return yaml.dump(obj);
};
exports.EXAMPLES_DIR = __dirname + '/../examples/';
exports.FHIR_DIR = __dirname + '/../fhir/';

exports.eachSample = function(opts, cb){
    var items = fs.readdirSync(exports.EXAMPLES_DIR);
    var limit = opts.limit || items.length;
    for (var i=0; i < limit; i++) {
        var file = items[i];
        var skip = opts.skip_list && opts.skip_list.some(function(x){ return file.indexOf(x) > -1; });
        if(file.match(/json$/) && !skip){
            var content = JSON.parse(fs.readFileSync(exports.EXAMPLES_DIR + file));
            cb(content, file);
        }
    }
};
