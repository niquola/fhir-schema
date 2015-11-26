module.exports = {
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
