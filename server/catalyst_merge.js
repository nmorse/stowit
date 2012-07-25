/* in the mongo shell 
 * >show dbs;
 * >use cat;
 * >db.markers.find();
*/
//var nps = require('../catmarks/nodepubsub');
//var  list_1 = [{"name":"My Course List","items":[{"name":"AGRI 4800 Directed Study","link":"http://catalog.viridianspark.com/2011/Courses/AGRI/4000/AGRI-4900.aspx"}]}];
//var  list_2 = [{"name":"My Course List","items":[{"name":"AGRI 4900 Directed Study","link":"http://catalog.viridianspark.com/2011/Courses/AGRI/4000/AGRI-4900.aspx"}]}];

//console.log(JSON.stringify(list_1, null, " "));
//console.log(JSON.stringify(list_2, null, " "));
//list_1 = merge_lists(list_1, list_2);
//console.log(JSON.stringify(list_1, null, " "));



(function(exports){
    var class2type = {};
    //copy of the jQuery.each() (we could get rid of this if there is an equivalent ;)
    exports.each = function( object, callback) {
        var name, i = 0,
            length = object.length,
            isObj = length === undefined;

        if ( isObj ) {
            for ( name in object ) {
                if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                    break;
                }
            }
        } else {
            for ( var value = object[0];
                i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
        }

        return object;
    };
    // Populate the class2type map
    exports.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });
    exports.type = function( obj ) {
        return obj === null ?
            String( obj ) :
            class2type[ toString.call(obj) ] || "object";
    };
    exports.isFunction = function( obj ) {
		return exports.type(obj) === "function";
	};
	exports.isArray = function( obj ) {
		return exports.type(obj) === "array";
	};
    exports.isPlainObject = function( obj ) {
		return exports.type(obj) === "object";
	};

    exports.merge_items = function(target, source) {
        exports.each(source, function(i, s) {
            var match = false;
            exports.each(target, function(j, t) {
                if (s.name === t.name) {
                    match = t;
                    return false;
                }
            });
            if (!match) {
                target.push(s);
            }
        });
        return target;
    };

    exports.merge = function(target, source) {
        exports.each(source, function(i, s) {
            target[i] = s;
        });
        return target;
    };

    //
    exports.merge_lists = function(target, source) {
        exports.each(source, function(i, s) {
            var match = false;
            exports.each(target, function(j, t) {
                console.log(s.name+" | "+t.name);
                if (s.name === t.name) {
                    match = t;
                    return false;
                }
            });
            if (match) {
                target.items = exports.merge_items(match.items, s.items);
            }
            else {
                target.push(s);
            }
        });
        return target;
    };

})(exports);
