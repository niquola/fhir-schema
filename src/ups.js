function (data, dataPath) {
    'use strict';
    var vErrors = null;
    var errors = 0;
    var errs0 = errors;
    if (! true) {
        if (errs0 == errors) {
            var err =   {
                keyword: 'custom' , dataPath: (dataPath || '') + "" , params: {
                    keyword: '$rule.keyword' }  , message: 'should pass "schemaProperty" keyword validation'  };
            if (vErrors === null) vErrors = [err];
            else vErrors.push(err);
            errors++;
        } else {
            for (var i0=errs0; i0<errors; i0++) {
                var ruleErr0 = vErrors[i0];
                if (ruleErr0.dataPath === undefined) {
                    ruleErr0.dataPath = (dataPath || '') + "";
                }  } } }  if ((!data || typeof data !== "object" || Array.isArray(data))) {
                    var err =   {
                        keyword: 'type' , dataPath: (dataPath || '') + "" , params: {
                            type: 'object' }  , message: 'should be object'  };
                    if (vErrors === null) vErrors = [err];
                    else vErrors.push(err);
                    errors++;
                } validate.errors = vErrors;
    return errors === 0;
}
