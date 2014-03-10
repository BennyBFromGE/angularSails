angular.module('angularSails',['angularSails.io','angularSails.model'])
.provider('$sails',function(){
  function SailsProvider = function($rootScope,$q,$http,$sailsSocket,$sailsResource){};
  return {
    '$get' : ['$rootScope','$q','$http','$sailsSocket','$sailsResource',SailsProvider]
  };
})
