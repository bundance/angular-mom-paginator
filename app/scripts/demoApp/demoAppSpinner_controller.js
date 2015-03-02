'use strict';

angular.module('angularMomPaginatorApp')

    .controller('DemoAppSpinnerCtrl', ['$scope', 'momPaginator', 'gitHubData', function($scope, momPaginator, gitHubData){

        // Set $sope's properties
        $scope.model = {
            page: 1
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

        // Seet $scope's Functions
        $scope.toggleSort = function(sortParams){
            return $scope.paginator.toggleSort(sortParams.columnName)
                .then(function(){
                    return {icon: $scope.paginator.getSortIcon(sortParams.columnName)};
                })
            };

        $scope.getPage = function(getPageParams){
            return $scope.paginator.getPage(getPageParams.pageNum);
        };

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
