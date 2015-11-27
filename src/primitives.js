module.exports = {
    date: {
        type: 'string',
        pattern: "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1]))?)?"
    },
    decimal: {
        type: 'number'
    },
    uri: {
        type: 'string'
    },
    dateTime: {
        type: 'string',
        pattern: "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?([Z+-]((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?)?)?)?"
    },
    instant: {
        type: 'string',
        pattern: "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?([Z+-]((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?)?)?)?"
    },
    time: {
        type: 'string',
        pattern: "([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?"
    },
    code: {
        type: 'string',
        pattern: "[^\s]+([\s]+[^\s]+)*"
    },
    markdown: {
        type: 'string'
    },
    fhir_id: {
        type: 'string',
        pattern: "[A-Za-z0-9\-\.]{1,64}"
    },
    oid: {
        type: 'string',
        pattern: "urn:oid:[0-2](\.[1-9]\d*)+"
    },
    xhtml: {
        type: 'string'
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
        type: 'string'
    },
    base64Binary: {
        type: 'string',
        media: {
            "binaryEncoding": "base64"
        }
    }
}
