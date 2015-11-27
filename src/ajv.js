var gen = require('./generation');
var ajv = require('ajv');
var utils = require('./utils');

function addCustomKeyword(validator){
    var rootschema = {
        inline: function (it, data){
            var $data = 'data' + (it.dataLevel || '');
            var out = "";
            var pairs = [];
            for(var k in data.schemas){
                var $refVal = it.resolveRef(it.baseId, data.schemas[k], it.isRoot);
                $refVal =  $refVal.code || $refVal;
                if ($refVal === undefined) {
                    throw new Error("Could not resolve" + data.schemas[k]);
                }
                pairs.push([k, $refVal]);
            }
            var attrs = pairs.map(function(p){
                return p[0] + ':' + p[1];
            }).join(',');
            return "(function(){ var ref = {" + attrs + "}[" + $data + ".resourceType]; "
                + " var res = ref("+ $data +", (dataPath || '')); "
                + " vErrors = ref.errors;"
                + " errors = ref.errors ? ref.errors.length : errors;"
                + " return true; })()";
        }
    };
    validator.addKeyword('schemaProperty', rootschema);
}

exports.load = function(schema){
    var schemaProperty = {
        keyword: 'resourceType',
        schemas: {}
    };

    for(var k in schema.definitions){
        schemaProperty.schemas[k] = gen.typeRef(k);
    }
    schema.schemaProperty = schemaProperty;
    var validator = ajv({allErrors: true});

    addCustomKeyword(validator);

    var validate = validator.compile(schema);

    schema.validate = function(res){
        var rt = res.resourceType;
        utils.assert(rt, "expected resourceType prop");
        var sch = schema.definitions[rt];
        utils.assert(sch, "No schema for " + rt);
        var valid = validate(res);
        if (!valid){
            return {errors: utils.copy(validate.errors), valid: false};
        }else{
            return {valid: true};
        }
    };
    return schema;
}

exports.makeSchema = function(cb){
    var schema = gen.makeSchema(cb);
    return exports.load(schema)
};
