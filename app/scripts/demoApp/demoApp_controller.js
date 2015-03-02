'use strict';

angular.module('angularMomPaginatorApp')
    .controller('DemoAppCtrl', ['$scope', 'momPaginator', 'gitHubData', function($scope, momPaginator, gitHubData){

        // Set $sope's properties
        $scope.model = {
            page: 1,
            pages: []
        };

        $scope.paginator = momPaginator({
            rstSvc: gitHubData,
            initialPage: 5,
            itemsPerPage: 10,
            sortIcons: {
                sortIconUp: 'glyphicon glyphicon-arrow-up',
                sortIconDown: 'glyphicon glyphicon-arrow-down',
                sortIconNone: 'glyphicon glyphicon-resize-vertical'
            }
        });


        // Set watches
        $scope.$watch('model.page', function(newPageNum){
            _getPage(newPageNum);
        });


        // Initialise the paginator
        $scope.paginator.initialise()
            .then(_getPage);


        //////////////////

        /*  Helper functions  */

        function _getPage(pageNum){
            return $scope.paginator.getPage(pageNum)
                .then(function(){
                    $scope.model.pages = $scope.paginator.getPageNumbers();
                })
            }

    }]);
