'use strict'

/**
 * sails.io
 *
 * @description
 *
 * Core module for Socket.io interactions with Sails. This module is required to use angularSails, but can also be used standalone.
 *
 * This module *replaces* the sails.io.js file, as it provides the same functionality, customized for use with AngularJS.
 *
 * @requires socket.io.js
 *
 * @version v0.0.0
 * @link http://github.com/balderdashy/angularSails
 *
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module('angularSails.io', [])


/**
 * @ngdoc provider
 * @name sails.io.$sailsSocket
 *
 * @description
 *
 * This provider returns a service that allows you to create a connection to a Sails server via socket.io.
 *
 *
 *
 * Code from :
 *
 * - angular-socket-io by Brian Ford : https://github.com/btford/angular-socket-io
 *
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 *
 * sails.io.js by Balderdashy : https://github.com/balderdashy/sails
 */

    .provider('$sailsSocket', function() {
        var defaultPrefix = 'sails:',
            ioSocket;

        // expose to provider
        return {
            '$get' :  ['$q', '$rootScope', '$timeout', '$window', function($q, $rootScope, $timeout, $window) {


                /**
                 * TmpSocket
                 *
                 * A mock Socket used for binding events before the real thing
                 * has been instantiated (since we need to use io.connect() to
                 * instantiate the real thing, which would kick off the connection
                 * process w/ the server, and we don't necessarily have the valid
                 * configuration to know WHICH SERVER to talk to yet.)
                 *
                 * @api private
                 * @constructor
                 */



                var asyncAngularify = function(socket, callback) {
                    return callback ? function() {
                        var args = arguments;
                        $timeout(function() {
                            callback.apply(socket, args);
                        }, 0);
                    } : angular.noop;
                };

                var sailsRequest = function(socket, method, url, data) {

                    var sailsDeferredRequest = $q.defer()

                    url = url.replace(/^(.+)\/*\s*$/, '$1');
                    // If method is undefined, use 'get'
                    method = method || 'get';

                    if (typeof url !== 'string') {
                        sailsDeferredRequest.reject(new Error('Invalid or missing URL!\n' + usage));
                    }
                    //sails accepts requests formatted as {url : '/api/foos', data: {id : 1}} over websockets
                    var requestJson = io.JSON.stringify({
                        url: url,
                        data: data
                    });

                    // Send the message over the socket
                    socket.emit(method, requestJson, asyncAngularify(socket, function afterEmitted(result) {
                        console.log(result)
                        if (result && typeof result === 'string') {
                            try {
                                parsedResult = io.JSON.parse(result);
                            } catch (e) {
                                if (typeof console !== 'undefined') {
                                    console.warn("Could not parse:", result, e);
                                }
                                return sailsDeferredRequest.reject("Server response could not be parsed!\n" + result);
                            }
                        }

                        if (parsedResult.status == 404) return sailsDeferredRequest.reject(new Error("404: Not found"));

                        if (parsedResult.status == 403) return sailsDeferredRequest.reject(new Error("403: Forbidden"));

                        if (parsedResult.status == 500) return sailsDeferredRequest.reject(new Error("500: Server Error"));

                        else return sailsDeferredRequest.resolve(parsedResult)
                    }));

                    return sailsDeferredRequest.promise;
                };

                return function sailsSocket(options) {

                    options = options || {};

                    //allow connection to remote APIs

                    var url = options.baseUrl || $window.location.origin || 'http://localhost:1337';

                    //check if options contains a token for JWT.

                    if (options.token) {
                        var authString = "?token=" + options.token;
                        url = url + authString;
                    }
                    //connect the socket.

                    var socket = io.connect(url) || options.ioSocket;
                    //prefix for forwarding

                    var prefix = options.prefix || defaultPrefix;

                    //default scope to apply to

                    var defaultScope = options.scope || $rootScope;
                    //adds a socket listenter

                    var addListener = function(eventName, callback) {

                        socket.on(eventName, asyncAngularify(socket, callback));

                    };

                    var connect = function(options){

                        var _socket = io.connect(options);

                        _socket.on('connect',function(){

                            deferredSocket.resolve(sailsSocket);

                        })
                    }

                    //a wrapper around a socket.io connection, to work with the sails API

                    var sailsSocket = {

                        connect : connect,

                        on: addListener,

                        addListener: addListener,

                        emit: function(eventName, data, callback) {

                            return socket.emit(eventName, data, asyncAngularify(socket, callback));

                        },

                        removeListener: function() {

                            return socket.removeListener.apply(socket, arguments);
                        },

                        forward: function(events, scope) {

                            if (events instanceof Array === false) {

                                events = [events]

                            }

                            if (!scope) {

                                scope = defaultScope;

                            }

                            events.forEach(function(eventName) {

                                var prefixedEvent = prefix + eventName;

                                var forwardBroadcast = asyncAngularify(socket, function(data) {

                                    scope.$broadcast(prefixedEvent, data)

                                });


                                scope.$on('$destroy', function() {

                                    socket.removeListener(eventName, forwardBroadcast)

                                });

                                socket.on(eventName, forwardBroadcast);
                            });
                        },

                        //sails REST API over socket.io with promises ftw

                        get: function(path, query) {

                            return sailsRequest(socket, 'get', path, query)

                        },

                        post: function(path, data) {

                            return sailsRequest(socket, 'post', path, data)

                        },

                        put: function(path, data) {

                            return sailsRequest(socket, 'put', path, data)

                        },

                        delete: function(path, data) {

                            return sailsRequest(socket, 'delete', path, data)

                        }

                    };

                    return sailsSocket
                };
            }
            ]};
    })

    //decorate $q so we can use success/error
    .config(['$provide',
        function($provide) {
            $provide.decorator('$q', function($delegate) {
                var defer = $delegate.defer;
                $delegate.defer = function() {
                    var deferred = defer();
                    deferred.promise.success = function(fn) {
                        deferred.promise.then(function(value) {
                            fn(value);
                        });
                        return deferred.promise;
                    };
                    deferred.promise.error = function(fn) {
                        deferred.promise.then(null, function(value) {
                            fn(value);
                        });
                        return deferred.promise;
                    };
                    return deferred;
                };
                return $delegate;
            })
        }
    ]);
