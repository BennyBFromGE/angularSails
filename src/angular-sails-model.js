angular.module('angularSails.model')
/**
* $innitResource - provides a Sails specific $resource - type implementation.
* @return {[type]} [description]
*/
.provider('$sailsResource', function () {

  var MODEL_ACTIONS = {
    'find': { method:'get'},
    'findOne': { method:'get'},
    'create' : { method : 'post'},
    'update' : { method : 'put'},
    'destroy' : { method : 'delete'}
  };
  var MODEL_INSTANCE_ACTIONS = {
    'save' : {method : 'PUT'},
    'destroy' : {method : 'DELETE'}
  };

  this.$get = ['$rootScope','$q','$http',function($rootScope,$q,$http) {

    var SailsResource = function(socket,model,options){
      var _model = this;
      var _records = [];

      _model.attributes = {}
      _model.associations = {}
      _model.identity = model.key;
      _model.name = model.name;
      _model.basePath = '/' + model.key;
      _model.socket = undefined;


      angular.forEach(MODEL_ACTIONS,function(action,key){
        _model[key] = function(params){
          var deferredQuery = $q.defer();

          return deferredQuery.promise;
          }
        })
      }

      SailsResource.prototype.onSailsResourceEvent = function(ev,data){
        console.log(ev)
        console.log(data)



      }

      var SailsRecord = function(_model,data){
        var _rec = this;

        // Object.defineProperty(_rec, '_model', {
        //   enumerable: false,
        //   writable: false,
        //   value: _model
        // });

        angular.forEach(data,function(value,key){
            _rec[key] = value;
          })

      //  _model.$sailsStream.subscribe(_model.identity + ':' + data.id,function(ev,data){
          return _rec.onModelInstanceEvent(ev,data)
        })
      }

      SailsRecord.prototype.save = function(){
        //save to db;
      };

      SailsRecord.prototype.destroy = function(){
      }

      SailsRecord.prototype.onModelInstanceEvent = function(recId,eventData){
        var _rec = this;
        if(eventData.data.verb == 'updated'){
          angular.copy(eventData.data.record,_rec)
        }
      }


    return function(socket,model,options){
      return new SailsResource(socket,model,options)
    }
  }];
})
