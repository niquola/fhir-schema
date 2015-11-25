tv4 = require('tv4')

OVERRIDEN = {
    date: {
        id: 'date',
        type: 'string',
        pattern: /-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1]))?)?/
    },
    decimal: {
        id: 'decimal',
        type: 'number'
    },
    uri: {
        id: 'uri',
        type: 'string'
    },
    dateTime: {
        id: 'dateTime',
        type: 'string',
        pattern: /-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?/
    },
    instant: {
        id: 'instant',
        type: 'string',
        pattern: /-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?/
    },
    time: {
        id: 'time',
        type: 'string',
        pattern: /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?/
    },
    code: {
        id: 'code',
        type: 'string',
        pattern: /[^\s]+([\s]+[^\s]+)*/
    },
    markdown: {
        id: 'markdown',
        type: 'string'
    },
    id: {
        id: 'id',
        type: 'string',
        pattern: /[A-Za-z0-9\-\.]{1,64}/
    },
    oid: {
        id: 'oid',
        type: 'string',
        pattern: /urn:oid:[0-2](\.[1-9]\d*)+/
    },
    unsignedInt: {
        type: 'integer',
        minimum: 0,
        exclusiveMinimum: true
    },
    positiveInt: {
        type: 'integer',
        minimum: 0,
        exclusiveMinimum: true
    },
    uuid: {
        id: 'uuid',
        type: 'string'
    },
    base64Binary: {
        id: 'base64Binary',
        type: 'string',
        media: {
            "binaryEncoding": "base64"
        }
    }
}

var assert = function(pred, msg){if(!pred) { throw new Error(msg || "Assert failed")}}

var isPrimitive = function(tp){
    return ['string', 'integer', 'number', 'boolean'].indexOf(tp) > -1
}

var typeRef = function(tp){
    assert(tp, "expected type")
    return 'main#/definitions/' + tp;
}

var getIn = function(obj, path){
    return path.reduce(function(acc, next){
        return acc ? acc[next] : acc;
    }, obj);
}

var isRequired = function(el){ return (el.min && el.min === 1) || false; }

var minItems = function(el){ return (el.min && el.min === 0) ? 0 : el.min; }

var isPolymorphic = function(el){ return el.path.indexOf('[x]') > -1;}


var elementType = function(el){
    if(! el.type) {return 'object';}
    var code = getIn(el, ['type', 0, 'code'])
    if (code === 'Reference') {
        return {$ref: typeRef('Reference')}
    }
    assert(el.type.length == 1, el.path + JSON.stringify(el.type));
    assert(code, JSON.stringify(el))
    if(isPrimitive(code)) {
        return code;
    } else if (code === 'BackboneElement') {
        return 'object'
    } else {
        return {$ref: typeRef(code)}
    }
}

var copy = function(x){ return JSON.parse(JSON.stringify(x))}

var capitalize = function(s){
    assert(s, "Expecting string")
    return s[0].toUpperCase() + s.slice(1);
}

var merge =function(src, attrs){
    var target = copy(src);
    for(var k in attrs){
        target[k] = attrs[k];
    }
    return target;
}

var expandPath = function(spath, tp){
    var path = spath.split('.')
    var last = path[path.length - 1]
    var newpath = path.slice(0, path.length - 1);
    newpath.push(last.replace('[x]', capitalize(tp.code)))
    return newpath.join('.');
}

var isFhirPrimitive = function(el){
    var tp = getIn(el, ['type', 0, 'code']);
    return tp && tp[0].toLowerCase() == tp[0]
}
var primitiveExtensions = function(prop, el){
    if(isFhirPrimitive(el)){
        var path = copy(prop.$$path);
        var last = path[path.length - 1];
        path[path.length - 1] = "_" + last;
        var eprop = null;
        var extension = {type: 'object', properties: {extension: {type: 'array', items: {oneOf: [{$ref: typeRef('Extension')}, {type: 'null'}]}}}}
        if(prop.type == 'array'){
            eprop = {$$path: path, type: 'array', items: {oneOf: [extension, {type: 'null'}]}}
        }else{
            extension.$$path = path;
            eprop = extension;
        }
        return [prop, eprop]
    }else{
        return [prop]
    }
}

var onlyTypedElement2schema = function(el){
    assert(el.path, JSON.stringify(el))
    var path = el.path.split('.');

    var res = {$$path: path, title: el.short};
    if(path.length == 1){
        //root element
        res.id = path[0]
        res.type = 'object'
    } else if (el.max === '*'){
        res.type = 'array' ;
        res.minItems = minItems(el);
        res.items = {}
        var etp = elementType(el);
        if(etp.$ref){
            res.items.$ref = etp.$ref 
        }else{
            res.items.type = etp;
        }
        //HACK: handle null in extension and primitve arrays
        if(path[path.length - 1] == 'extension' || isFhirPrimitive(el)){
            res.items = {oneOf: [res.items, {type: 'null'}]} 
        }
    } else {
        // res.$$required = isRequired(el);
        var etp = elementType(el);
        if(etp.$ref){
           res.$ref = etp.$ref 
        }else{
           res.type = etp;
        }
    }
    if(res.type == 'object'){
        res.additionalProperties = false
        res.properties = res.properties || {}
        res.properties.fhir_comments = {type: 'array', items: {type: 'string'}} 
    }
    return primitiveExtensions(res, el)
}

var element2schema = function(el){
    assert(el.path, JSON.stringify(el))
    if(isPolymorphic(el)){
        return el.type.reduce(function(acc, tp){
            var newpath = expandPath(el.path, tp);
            return acc.concat(onlyTypedElement2schema(
                merge(el, {type: [tp], path: newpath})
            ))
        }, []);
    }
    return onlyTypedElement2schema(el)
};

exports.element2schema = element2schema;

var addToSchema = function (sch, elem){
    var path = elem.$$path
    delete elem.$$path
    var cur = sch;
    sch.properties = sch.properties || {}
    for(var i = 0; i < path.length - 1; i++){
        var item = path[i];
        cur.properties = cur.properties || {}
        cur = cur.properties[item]
        assert(cur, item)
        if(cur.type && cur.type == 'array'){
            cur = cur.items;
        }
    }
    item = path[path.length - 1]
    if(cur.type == 'array'){
        cur.item.properties = cur.item.properties || {}
        cur.item.properties[item] = elem;
    } else {
        cur.properties = cur.properties || {}
        cur.properties[item] = elem;
    }
    return sch;
}
var addStructureDefinition = function(schema, structureDefinition){
    var rt = structureDefinition.name
    if(OVERRIDEN[rt]) {return schema}
    if(isPrimitive(rt)) {return schema}
    var sd =  structureDefinition
        .snapshot
        .element
        .reduce(function(acc, el){
            var res = element2schema(el)
            if(!res) throw new Error('UPS:' + el)
            return res.reduce(function(acc, el){
                return addToSchema(acc, el);
            }, acc)
        }, {});

    schema.definitions = schema.definitions || {}
    var resourceSchema = sd.properties[rt]
    if(resourceSchema && resourceSchema.properties) {
        resourceSchema.properties.resourceType = {type: 'string'}
    }
    schema.definitions[rt] = resourceSchema;
    return schema;
}

var addValueSet = function(schema, valueSet){
}

exports.addToSchema = function(schema, resource){
    var rt = resource.resourceType 
    if(rt == 'StructureDefinition'){
        return  addStructureDefinition(schema, resource)
    } else if (rt == 'ValueSet'){
        return addValueSet(schema, resource);
    }
};

var fixSchema = function(schema){
    if(schema.definitions.Resource){
        schema.definitions.Resource.additionalProperties = true
    }
    if(schema.definitions.DomainResource){
        schema.definitions.DomainResource.additionalProperties = true
    }
    if(schema.definitions.Element){
        schema.definitions.Element.additionalProperties = true
    }
    for(var k in OVERRIDEN){
        var v = OVERRIDEN[k]
        schema.definitions[k] = v
    }
    return schema;
}

exports.buildSchema = function(cb){
    var schema = {};
    schema = cb(schema)
    fixSchema(schema)
    tv4.addSchema('main', schema);
    schema.validate = function(res){
        var rt = res.resourceType;
        assert(rt, "expected resourceType prop")
        var sch = schema.definitions[rt]
        assert(sch, "No schema for " + rt)
        return tv4.validateResult(res, sch)
    }
    return schema;
}
