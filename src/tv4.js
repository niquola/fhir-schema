var gen = require('./generation');
var tv4 = require('tv4');
var utils = require('./utils');

exports.makeSchema = function(cb){
    var schema = gen.makeSchema(cb, {refPrefix: 'fhir'});
    tv4.addSchema('fhir', schema);
    schema.validate = function(res){
        var rt = res.resourceType;
        utils.assert(rt, "expected resourceType prop");
        var sch = schema.definitions[rt];
        utils.assert(sch, "No schema for " + rt);
        return tv4.validateMultiple(res, sch);
    };
    return schema;
};
