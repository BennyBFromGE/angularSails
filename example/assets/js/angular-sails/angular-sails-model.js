angular.module('angularSails.model',[])
/**
 * $innitResource - provides a Sails specific $resource - type implementation.
 * @return {[type]} [description]
 */

    .factory('$sailsModel',function(){




    })

    .factory('$sailsRequest',function(){

        var SailsRequest = function(collection,method,data){



        }


    })
    .provider('$sailsCollection', function () {

        var collections = {}


        var MODEL_INSTANCE_ACTIONS = {
            'save' : {method : 'PUT'},
            'destroy' : {method : 'DELETE'}
        };

        var SailsCollection = function(modelName,model,connection,controller,options) {

            var COLLECTION_ACTIONS = {
                'find': { method:'get'},
                'findOne': { method:'get'},
                'create' : { method : 'post'},
                'update' : { method : 'put'},
                'destroy' : { method : 'delete'}
            };

            var _collection = this;

            var _controller = angular.extend(COLLECTION_ACTIONS,controller || {})

           var _properties = {}

            _properties.identity = model.identity || modelName.toLowerCase();
            _properties.name = modelName;
            _properties.basePath = '/' + model.identity;

            Object.defineProperty(_collection, '_properties', {
                enumerable: false,
                writable: false,
                value: _properties
            });

            Object.defineProperty(_collection, '_connection', {
                enumerable: false,
                writable: false,
                value: connection
            });

            Object.defineProperty(_collection, '_model', {
                enumerable: false,
                writable: false,
                value: model
            });

            angular.forEach(_controller,function(action,key){


                _collection[key] = function(){

                   return _collection._connection[action.method](_collection._properties.basePath,arguments);



                }

            })

        };

        return {
            '$get' : ['$rootScope','$q','$http',function($rootScope,$q,$http) {

                return function(modelName,model,connection,controller,options){

                    var collection =  new SailsCollection(modelName,model,connection,controller,options)

                    collections[collection._properties.identity] = collection;

                    return collection;
                }
            }]
        };
    });
