exports.assert = function(pred, msg){
    if(!pred) { throw new Error(msg || "Assert failed")}
}

exports.getIn = function(obj, path){
    return path.reduce(function(acc, next){
        return acc ? acc[next] : acc;
    }, obj);
}
exports.copy = function(x){
    return JSON.parse(JSON.stringify(x))
}

exports.capitalize = function(s){
    exports.assert(s, "Expecting string")
    return s[0].toUpperCase() + s.slice(1);
}

exports.merge =function(src, attrs){
    var target = exports.copy(src);
    for(var k in attrs){
        target[k] = attrs[k];
    }
    return target;
}

exports.last = function(arr){
    return arr && arr[arr.length - 1]
}
