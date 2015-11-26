tv4 = require('tv4')

settings = {validate: {references: false}}
exports.settings = settings

var OVERRIDEN = require('./primitives')

var utils = require('./utils')

var isPrimitive = function(tp){
    return ['string', 'integer', 'number', 'boolean'].indexOf(tp) > -1
}

var typeRef = function(tp){
    utils.assert(tp, "expected type")
    return 'main#/definitions/' + tp;
}

var isRequired = function(el){ return (el.min && el.min === 1) || false; }

var minItems = function(el){ return (el.min && el.min === 0) ? 0 : el.min; }

var isPolymorphic = function(el){ return el.path.indexOf('[x]') > -1;}

var buildReferenceSchema = function(el){
    var resources = el.type.reduce(function(acc, tp){
        if(tp.profile){ acc.push(utils.last(tp.profile[0].split('/'))) }
        return acc
    }, [])

    if(!settings.validate.references || resources.length === 0 || resources.indexOf('Resource') > -1){
        return {$ref: typeRef('Reference')}
    }
    var pattern  = '/(#|' + resources.join('|') + ')/i'
    return { allOf: [
        {$ref: typeRef('Reference')},
        {type: 'object', properties: {reference: {type: 'string', pattern: pattern}}}
    ]}
}

var elementType = function(el){
    if(!el.type) {return 'object';}
    var code = utils.getIn(el, ['type', 0, 'code'])
    if (code === 'Reference') {
        return buildReferenceSchema(el)
    }

    utils.assert(el.type.length == 1, el.path + JSON.stringify(el.type));
    utils.assert(code, JSON.stringify(el))

    if(isPrimitive(code)) {
        return code;
    }
    if (code === 'BackboneElement') {
        return 'object'
    }
    return {$ref: typeRef(code)}
}

var expandPath = function(spath, tp){
    var path = spath.split('.')
    var last = path[path.length - 1]
    var newpath = path.slice(0, path.length - 1);
    newpath.push(last.replace('[x]', utils.capitalize(tp.code)))
    return newpath.join('.');
}

var isFhirPrimitive = function(el){
    var tp = utils.getIn(el, ['type', 0, 'code']);
    return tp && tp[0].toLowerCase() == tp[0]
}

var EXTENSION = {
    type: 'object',
    properties: {
        extension: {
            type: 'array',
            items: {
                oneOf: [{$ref: typeRef('Extension')}, {type: 'null'}]
            }
        }
    }
}
var EXTENSION_ARRAY= {
    type: 'array',
    items: {oneOf: [EXTENSION, {type: 'null'}]}
}

var primitiveExtensions = function(prop, el){
    if(isFhirPrimitive(el)){
        var path = utils.copy(prop.$$path);
        path[path.length - 1] = "_" + utils.last(path);
        var eprop = utils.merge((prop.type == 'array') ? EXTENSION_ARRAY : EXTENSION, {$$path: path})
        return [prop, eprop]
    } else {
        return [prop]
    }
}

var onlyTypedElement2schema = function(el){
    utils.assert(el.path, JSON.stringify(el))
    var path = el.path.split('.');

    var res = {$$path: path, title: el.short};
    if(settings.build){
        delete res.title
    }
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
        }else if(etp.allOf){
            res.items.allOf = etp.allOf
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
        }else if(etp.allOf){
            res.allOf = etp.allOf
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
    utils.assert(el.path, JSON.stringify(el))
    if(isPolymorphic(el)){
        var groupedTypes = el.type.reduce(function(acc, tp){
            acc[tp.code] = acc[tp.code] || []
            acc[tp.code].push(tp)
            return acc
        }, {})

        var result = []
        for(var code in groupedTypes){
            var types = groupedTypes[code]
            var newpath = expandPath(el.path, {code: code});
            result.push.apply(result, onlyTypedElement2schema(
                utils.merge(el, {type: types, path: newpath})
            ))
        }
        return result;
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
        utils.assert(cur, item)
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
        var resourceType = structureDefinition
            .snapshot
            .element[0].path;

        resourceSchema.properties.resourceType = {
            type: 'string',
            pattern: '^' + resourceType + '$'
        };
    }
    schema.definitions[rt] = resourceSchema;
    return schema;
}

var addValueSet = function(schema, valueSet){

    function isInlineCodeSystem(valueSet) {
        if (valueSet.compose) return false;
        return valueSet.codeSystem !== undefined;
    }

    function expandConcepts(valueSet) {
        function addCodesToExpansion(expansion, concept) {
            expansion.push({
                system: valueSet.codeSystem.system, //TODO
                code: concept.code
            });

            if (concept.concept) {
                expansion = expand(concept.concept, expansion);
            }

            return expansion;
        }

        function expand(concept, expansion) {
            return concept.reduce(addCodesToExpansion, expansion);
        }

        return expand(valueSet.codeSystem.concept, []);
    }

    function inlineCodeSystemForCode(valueSet) {
        var codeSchema = {};
        codeSchema.type = 'string';
        codeSchema.enum = expandConcepts(valueSet).map(function (concept) {
            return concept.code;
        });
        return codeSchema;
    }

    function inlineCodeSystemForCodeableConcept(valueSet) {
        var concepts = expandConcepts(valueSet);
        var ccSchema = {
            type: 'object',
            required: ['coding'],
            properties: {
                coding: {
                    type: 'array',
                    minItems: 1,
                    items: [
                        {
                            oneOf: concepts.map(function(item){
                                return {
                                    type: 'object',
                                    required: ['system', 'code'],
                                    properties: {
                                        system: {
                                            type: 'string',
                                            pattern:  '^' + item.system + '$'
                                        },
                                        code: {
                                            type: 'string',
                                            pattern: '^' + item.code + '$'
                                        }
                                    }
                                }
                            })
                        }
                    ],
                    additionalItems: true
                }
            }

        };

        return ccSchema;
    }

    var url = valueSet.url;
    var valueSetSchema = {
        id: url
    };

    if (isInlineCodeSystem(valueSet)){
        valueSetSchema.oneOf = [];
        valueSetSchema.oneOf.push(inlineCodeSystemForCode(valueSet));
        valueSetSchema.oneOf.push(inlineCodeSystemForCodeableConcept(valueSet));
    }

    schema.definitions = schema.definitions || {};
    schema.definitions[url] = valueSetSchema;
    return schema;
};

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
        utils.assert(rt, "expected resourceType prop")
        var sch = schema.definitions[rt]
        utils.assert(sch, "No schema for " + rt)
        return tv4.validateResult(res, sch)
    }
    return schema;
}
