angular.module('modelMocks',[]).
    factory('Comment',['$sailsModel',function($sailsModel){
        function Comment(){}

        return Comment;

    }])