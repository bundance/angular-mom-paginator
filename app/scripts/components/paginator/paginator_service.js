'use strict';

/**
 * @momUI.momPaginator service
 * @name momPaginator
 * @author: Mike Evans
 *
 * @description
 * The momPaginator is an AngularJS service that pulls in data from a ReST API, paginates it, and provides functions
 * for navigating through the pages, sorting them and ordering them however you wish.
 *
 * @example
 *  <table>
 *  ...
 *      <tr ng-repeat="item in modelpaginator.currentPageItems">
 *          <td>{{item.property1}}</td>
 *          <td>{{item.property2}}</td>
 *          <td>{{item.property3}}</td>
 *      </tr>
 *  </table>
 *
 *  <div class="pagination-btns">
 *      <button class="btn btn-mini btn-primary pagination-prev-btn" ng-click="paginator.first()">
 *          << First
 *      </button>
 *      <button class="btn btn-mini btn-primary pagination-prev-btn" ng-click="paginator.prev()">
 *          < Prev
 *      </button>
 *      <button class="btn btn-mini btn-primary pagination-prev-btn" ng-click="paginator.next()">
 *          Next >
 *      </button>
 *      <button class="btn btn-mini btn-primary pagination-next-btn" ng-click="paginator.last()">
 *          Last >>
 *      </button>
 *  </div>
 *
 *
 */
angular.module('momUI.momPaginator', [])
    .factory('momPaginator', ['$q', function($q) {
        return function(opts) {

            var optsClone = angular.copy(opts) || {};

            var restSvc = optsClone.rstSvc,
                currentPageItems = [],
                currentPageNum = optsClone.initialPage || 1,
                DEFAULT_ITEMS_PER_PAGE = 10,
                itemsPerPage = optsClone.itemsPerPage || DEFAULT_ITEMS_PER_PAGE,
                totalItemsCount = -1,
                totalPagesCount = 0,
                sortColumn = "",
                sortAscending = null,
                sortIcons = _getSortIconLookupTable(optsClone.sortIcons);


            /**
             * Public functions
             */
            var service = {
                initialise: initialise,
                getSortIcon: getSortIcon,
                getCurrentPageItems: getCurrentPageItems,
                getPage: getPage,
                getPageNumbers: getPageNumbers,
                getTotalItemsCount: getTotalItemsCount,
                getTotalPagesCount: getTotalPagesCount,
                pageExists: pageExists,
                next: next,
                prev: prev,
                first: first,
                last: last,
                toggleSort: toggleSort
            };


            return service;

            ///////////////////////////


            /**
             * @name initialise()
             * @private
             * @description - initialises the paginator service's properties by calling getTotalItemsCount()
             * and _calculateTotalPagesCount().
             *
             * Call this function first before doing anything else
             */
            function initialise(){

                return service.getTotalItemsCount()
                    .then(function(){
                        _calculateTotalPagesCount();
                    });
            }



            /**
             * @name getPage()
             * @params {number, number, boolean}
             * @returns {*} - Returns currentPageItems as an array of data on success;
             *              - Returns the response object on error
             *              - Returns an empty array if no data is received.
             * @description
             *  gets data from the server using the restSvc service. If more data is sent than
             *  itemsPerPage, the length of currentPageItems is adjusted accordingly.
             *  Parameters:
             *      - pageNum (optional) - specify what page number you want (defaults to 1)
             *      - sortColumn (optional) - specify a column to sort on
             *      - sortAscending (optional) - specify the direction to sort the results in.
             *          - true = sortAscending, false = sortDescending (default is false).
             */
            function getPage(pageNum, sortColumn, sortAscending){

                pageNum = pageNum || currentPageNum;

                service.sortColumn = sortColumn || service.sortColumn;
                service.sortAscending = sortAscending || service.sortAscending;

                if(service.pageExists(pageNum)){
                    return restSvc.getData(itemsPerPage, pageNum, sortColumn, sortAscending)
                        .then(_getPageSuccessHandler(pageNum))
                        .catch($q.reject)
                }
                else{
                    console.log("No more pages");
                    return $q.when([]);
                }

            }


            /**
             * @name _getPageSuccessHandler
             * @param pageNum
             * @returns {Function}
             * @private
             * @description Set the page items and other properties when getPage() returns successfully
             */
            function _getPageSuccessHandler(pageNum){
                return function(items){
                    currentPageItems = items;
                    currentPageNum = pageNum;
                    currentPageItems.length = _calculatePageItemsLength(items, itemsPerPage);

                    return currentPageItems;
                };
            }




            /**
             * @name: getTotalItemsCount()
             * @returns {Promise|*}
             * @description Returns the total number of items retrieved, or zero on error
             */
            function getTotalItemsCount(){

                return restSvc.getTotalItemsCount()
                    .then(_getTotalItemsCountSuccessHandler)
                    .catch(function(){
                        return 0;
                    })
            }

            /**
             * @name _getTotalItemsCountSuccessHandler
             * @param count
             * @returns {*}
             * @private
             * @description
             * Success handler for getTotalItemsCount, which simply set the totalItemsCount property
             */
            function _getTotalItemsCountSuccessHandler(count){
                    totalItemsCount = count;
                    return count;
            }

            /**
             * @name getTotalPagesCount
             * @returns {number}
             * @description Returns the total number of pages being paginated
             */
            function getTotalPagesCount(){

                return (totalPagesCount >= 0) ? totalPagesCount : _calculateTotalPagesCount();
            }


            /**
             * @name getCurrentPageItems
             * @returns {Array}
             * @description Returns the array of pageItems retrieved from the server. Note this is a single page's worth of data,
             * so if you've set itemsPerPage to 10, for example, the array will be 10 items in length.
             */
            function getCurrentPageItems(){
                return currentPageItems;
            }


            /**
             * @name getPageNumbers
             * @param lastPage
             * @returns {Array}
             * @description
             * Returns an array of all the page numbers in the paginator, from 1 to totalPagesCount
             */
            function getPageNumbers(lastPage){

                var arr = [];
                var currentPage = 1;

                lastPage = lastPage || service.getTotalPagesCount();

                while(currentPage <= lastPage){
                    arr.push(currentPage++);
                }
                return arr;
            }


            /**
             * @name pageExists
             * @returns {boolean}
             * @description Returns true if more pages are available from the server, false if not.
             * Internally, paginator.getTotalItemsCount() must be called first before this function can be used.
             * Externally, code using momPaginator won't need to worry about this, as it's taken care of below
             * as part of this paginator object's initialisation.
             */
            function pageExists(pageNum){
               return ((totalItemsCount < 0 || pageNum <= totalPagesCount) && pageNum > 0);
            }
            
            
            
            
            /***
             * @name next
             * @returns {*} Returns a promise, which, when resolved, returns an array containing the items of
             * currentPage + 1. Returns an empty array when there are no more pages left
             * @description Next() will iterate through the pages of data, retrieving the next itemsPerPage worth of data
             * each time it's called.
             * The last page may contain less than itemsPerPage of data.
             * For pages beyond the last page, an empty array is returned.
             */
            function next(){
                return _goTo(currentPageNum + 1);
            }
            
            
            
            /***
             * @name next
             * @returns {*} Returns a promise, which, when resolved, returns an array containing the items of
             * currentPage - 1. Returns an empty array when there are no more pages left
             * @description The opposite of next(), prev() will iterate through the pages of data, retrieving the
             * previous itemsPerPage worth of data each time it's called.
             * All pages called using prev() will contain itemsPerPage of data.
             * For pages before the first page (i.e. pages before page 1), an empty array is returned.
             */
            function prev(){
                return _goTo(currentPageNum - 1);
            }
            
            
            
            /***
             * @name: first
             * @returns {*}
             * @description
             * Helper function that returns the first page of data as an array (once getData's promise resolves)
             */
            function first(){
                return _goTo(1);
            }
            
            
            
            
            /***
             * @name: first
             * @returns {*}
             * @description
             * Helper function that returns the last page of data as an array (once getData's promise resolves).
             */
            function last(){
                return _goTo(totalPagesCount);
            }
            

            
            /***
             * @name: toggleSort
             * @params sortColum - name of the column on which to sort the dataset
             * @returns {*}
             * @description
             * Enables sorting the dataset on sortColumn. Each call to this function with the same value for
             * sortColumn will toggle the direction of sorting (ASCending or DESCending (default))
             */
            function toggleSort(newSortColumn){

                sortAscending = (sortColumn === newSortColumn) ? !sortAscending : false;
                sortColumn = newSortColumn;

                return service.getPage(1, sortColumn, sortAscending);
            }
            
            
            
            /***
             * @name getSortIcon
             * @params sortColumn - name of the column to test if the data is being sorted on
             * @returns string
             * @description
             * Helper function that tests if columnName is being used to sort the data, and in which direction.
             * Depending on the result, the function will return the value you entered for sortIconUp (for ASC),
             * sortIconDown (for DESC) or sortIconNone (if columnName isn't being used to sort).
             */
            function getSortIcon(columnName){

                if(!sortColumn){
                    return sortIcons['none'];
                }
                return (columnName === sortColumn) ? sortIcons[sortAscending] : sortIcons['none'];

            }



            /////////////////////////
            // Helper Functions


            /**
             *
             * @name: _getSortIconLookupTable
             * @param sortIcons
             * @returns {{true: (sortIconUp|*|sortIconUp|sortIconUp), false: (sortIconDown|*|sortIconDown|sortIconDown), none: (sortIconNone|*|sortIconNone|sortIconNone)}}
             * @private
             *
             * Pass in the sortIcons from the opts argument and this will return a correctly formatted lookup table
             */
            function _getSortIconLookupTable(sortIcons){

                var sortIconsClone = angular.copy(sortIcons || {});


                return {
                    'true': sortIconsClone.sortIconUp,
                    'false': sortIconsClone.sortIconDown,
                    'none': sortIconsClone.sortIconNone
                };
            }


            /**
             * @name _goTo
             * @param pageNum
             * @returns {*}
             * @private
             * @description Higher order function that acts as a partially applied wrapper function around getPage
             */
            function _goTo(pageNum){
                return service.getPage(pageNum, sortColumn, sortAscending);
            }



            /**
             * @name: _calculateTotalPagesCount()
             * @returns {Number}
             * @description Calculates and returns the total number of pages that can be traversed by the Paginator.
             */
            function _calculateTotalPagesCount(){

                if(totalItemsCount < 0){
                    return 0;
                }
                totalPagesCount = parseInt(totalItemsCount / (itemsPerPage || DEFAULT_ITEMS_PER_PAGE));

                return (totalItemsCount % itemsPerPage > 0) ? totalPagesCount++ : totalPagesCount;
            }


            /**
             * @_calculatePageItemsLength
             * @param items
             * @param itemsPerPage
             * @returns {length|*|length|length|length|length}
             * @private
             * @description Calculates what the page item length should be according the number of items per page
             */
            function _calculatePageItemsLength(items, itemsPerPage){
                return (items.length < itemsPerPage) ? items.length : itemsPerPage;
            }



        };


    }]);
