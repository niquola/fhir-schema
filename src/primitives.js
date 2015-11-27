module.exports = {
    date: {
        type: 'string'
        // pattern: "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1]))?)?"
    },
    decimal: {
        type: 'number'
    },
    uri: {
        type: 'string'
    },
    dateTime: {
        type: 'string'
        // pattern: "/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/"
    },
    instant: {
        type: 'string'
        // pattern: "^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$"
    },
    time: {
        type: 'string'
        // pattern: "([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?"
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
