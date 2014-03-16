(function () {

  var app = angular.module('AngularSailsApp', ['angularSails']);

  app.config(['$sailsProvider',function($sailsProvider){

    $sailsProvider.model('Comment',
        {
            identity : 'comment',
            connection : 'server',
            attributes : {
                title : 'text'
            }

        })

      $sailsProvider.connection('server',{
          baseUrl : 'http://localhost:1337',
          type : 'socket',
          autoConnect : true

    })

  }]);

  app.run(function($sailsSocket,$sails){
     $sails.models.Comment.find().then(function(comments){
         console.log(comments)
     })
  })

  app.controller('CommentCtrl', ['$scope','$sailsSocket', function ($scope,$sailsSocket) {


    // Get the comments from the sails server.
    // $scope.comments = $sails('/comment');
    //
    // // Adds a comment.
    // $scope.addComment = function (e) {
    //   if (e.keyCode != 13) return;
    //
    //   $scope.comments.$add({
    //     body: $scope.newComment
    //   });
    //
    //   $scope.newComment = '';
    // };

  }]);

})();
