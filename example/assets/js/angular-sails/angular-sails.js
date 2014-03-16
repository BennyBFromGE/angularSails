'use strict'

angular.module('angularSails',['angularSails.io','angularSails.model'])

    .provider('$sails',function(){

        var _sailsConfig = {
            autoConnect : true,
            models : {},
            connections : {}
        };

        var Sails = function(sailsConfig){

            var sails = this;

            sails._config = sailsConfig;

            sails.models = {};

            sails.connections = {};

            return sails;
        };

        Sails.prototype.registerCollections = function($sailsCollection){

            var sails = this;

            angular.forEach(sails._config.models,function(model,modelName){
                var connection = sails.connections[model.connection]

                sails.models[modelName] = $sailsCollection(model,model,connection);

            })
        };

        Sails.prototype.registerConnections = function($sailsSocket){

            var sails = this;

            angular.forEach(sails._config.connections,function(connection,connectionName){

                sails.connections[connectionName] = $sailsSocket(connection);

                if(connection.autoConnect){
                    sails.connections[connectionName].connect()
                }

            })
        };

        return {
            '$get' : ['$rootScope','$injector','$q','$http','$sailsSocket','$sailsCollection',function($rootScope,$injector,$q,$http,$sailsSocket,$sailsCollection){

                var $sails = new Sails(_sailsConfig);

                $sails.registerConnections($sailsSocket);

                $sails.registerCollections($sailsCollection);

                return $sails;
            }],

            model : function(modelName,model){
                _sailsConfig.models[modelName] = model;
            },

            socket : function(socket){},

            connection : function(connectionName, connectionConfig){
                _sailsConfig.connections[connectionName] = connectionConfig;
            }
        };
    })
