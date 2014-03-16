angular.module('angularSails.waterline',[]).provider('$waterline',function(){

    var waterline = new Waterline()

    return {

        $get : function(){

            return waterline;

        },

        $adapter : function(adapter){

            angular.extend(_adapters,adapter)

        },

        $collection : function(def){
            _collections.push(Waterline.Collection.extend(def))
        }
    }


});