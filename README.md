#momPaginator - AngularJS Paginator service#

The momPaginator is an AngularJS service that pulls in data from a ReST API, paginates it, and provides functions
for navigating through the pages, sorting them and ordering them however you wish.

##TL;DR##
Just show me [an example](https://github.com/bundance/angular-mom-paginator#example)!

##Overview##
The momPaginator is a service that uses an external ReST service that you provide to pull in data from a ReST API. Once
the data has been retrieved, it's used to populate the momPaginator.currentPageItems[] array, which can then be used
easily in an HTML table via a simple ng-repeat on the table's <tr> element.

The momPaginator has been designed to support promises throughout its ReST calling functions, letting you indicate
to your user when your page is waiting for a response, and can easily be integrated into any of your existing HTML.

This last point is important. Many AngularJS paginators or datatables will try to provide the HTML for you as a template
in a directive. The problem with this approach, however, is that [browsers will not permit AngularJS to transclude tables](https://github.com/angular/angular.js/issues/1459)
(in English - you can't use AngularJS directives to generate tables).

Other paginators and datatables attempt to get round this by using nested DIVs, but in my opinion, this is as bad as
using tables for layout purposes, as it breaks the semantics of the HTML. If you're rendering a table, use the `<table>`
element!

So the momPaginator is implemented as a service, not a directive, which has the benefit of letting you put its
functionality wherever you want it to be.

It provides all the features you need, most of which can be used declaratively from the HTML itself.

##How to use the momPaginator##

###Setup###
The momPaginator service is defined in app/scripts/services/paginator.js. Include this in your file, register the
service as a dependency with your module, and you're nearly all set to use it.

The last remaining thing to do is to provide a ReST service that communicates with your ReST server, and which exposes
the following functions:

* `getData(itemsPerPage, pageNum, sortColumn, sortAscending)`
* `getTotalItemsCount()`


###Creating an instance of momPaginator###
You create an instance of momPaginator as follows:

```var paginator = momPaginator(ReSTService, itemsPerPage, initialPageNum, sortIcons);```

####Parameters####

* `ReSTService` - the ReST service used to communicate with your ReST API. The momPaginator service uses this to retrieve data.
* `itemsPerPage` - how many items of data a page should comprise (default is 10)
* `initialPageNum` - the page number you wish the pagination to start at (default is 1)
* `sortIcons` - an object comprising the following icon properties:
* `sortIconUp` name of the value you choose for the icon that represents sort ASCending in your application
* `sortIconDown` name of the value you choose for the icon that represents sort DESCending in your application
* `sortIconNone` name of the value you choose for the icon that represents no sorting applied

Upon creation, the momPaginator will immediately call its `getPage()` method to retrieve the first page of data, and return.
  You can use momPaginator's `promise` property to access this data once it's loaded, as follows:

```
$scope.model.paginator = momPaginator(gitHubData, 5, 1, {sortIconUp: 'glyphicon glyphicon-arrow-up',
               sortIconDown: 'glyphicon glyphicon-arrow-down',
               sortIconNone: 'glyphicon glyphicon-resize-vertical'});
           $scope.model.paginator.promise
               .then(function(){
                   $scope.model.paginator.getPage()
                       .then(function(){
                           $scope.model.pages = getPageNumbers($scope.model.paginator.totalPagesCount);
                       })
               });
```

####Properties####
Once an instance has been created, you have access to the following properties:


* `currentPageItems` - array
* `currentPageNum` - number
* `itemsPerPage` - number
* `totalItemsCount` - number
* `totalpagesCount` - number
* `promise` - $q,
* `sortColumn` - string
* `sortAscending` - string


####Methods####
* `getPage(pageNum, sortColumn, sortAscending)`*
Retrieves a page of data from the ReST API. Returns immediately with a promise, which, when completed, fills the
 currentPageItems array with the data retrieved, and returns it.
 * On error, returns the response
 * If no data is received, it returns an empty array.

* `getTotalItemsCount()`
Returns the number of total items contained in the dataset being paginated. Note that this is different from the number
 of page paginated. The function returns a promise, which, when completed, returns the total number of items contained
 in the dataset.

* `getTotalPagesCount()`
 Returns the number of total pages that have been paginated. The value returned here is the same as the value of the
 last page in the momPaginator. Does not return a promise, as it relies on getTotalItemsCount() having already been called
 (which is is upon the momPaginator's initial creation).

* `pageExists(pageNum)`
 Returns true if pageNum exists in the dataset, false otherwise.

* `next()`
 Returns the next page in the dataset as a promise, which, upon completion, fills the currentPageItems array with the
 data retrieved, and returns it.
 * If no more pages, returns an empty array

* `prev()`
Returns the previous page in the dataset as a promise, which, upon completion, fills the currentPageItems array with the
 data retrieved, and returns it.
 * If no more pages, returns an empty array

* `first()`
Helper function that returns `getPage(1)`

* `last()`
Helper function that returns `getPage( getTotalPagesCount() )`

* `toggleSort(columnName)`
Sorts the data by columnName. If the data hasn't been sorted before, it defaults to DESCending. Call this function
on the same column again, and it will be sorted ASCending.

* `getSortIcon(columnName)`
Helper function designed to provide a value of your choice according to whether the columnName entered has been used
 to sort the data, and the direction in which the data has been sorted.

 * If columnName has been used to sort in an ASCending direction, this function will return the value entered on
   momPaginator instance creation in sortIcons.sortIconUp
 * If columnName has been used to sort in an DESCending direction, this function will return the value entered on
   momPaginator instance creation in sortIcons.sortIconDown
 * If columnName has NOT been used to sort , this function will return the value entered on  momPaginator instance
 creation in sortIcons.sortIconNone


##The ReST Service##
This service must then be injected into the momPaginator upon first use (usually in your controller).

How your ReST service implements these functions will depend on the requirements of the ReST API you're using. The most
common approach is to implement a $resource tailored to your API, but you're free to use whatever you wish (e.g. an
$http object, $httpJson, or even a jQuery ajax call if you'd prefer).

The example in this repository includes a ReST service called rest.gitHubAPI, which was created to communicate with the
GitHub API. If you look at the code in app/shared/restAPI.js, you'll see rest.gitHubAPI defined as two services:

* `gitHubREST` - a simple wrapper around $resource, defined with the parameters specified by GitHub to access its API.
* `gitHubData` - the ReST service required by momPaginator, complete with the getData and getTotalItemsCount functions.

###ReST Service getData() Parameters###

#####getData(itemsPerPage, pageNum, sortColumn, sortAscending)#####

*Parameters*
* `itemsPerPage` - Number, stating how many items of data you want to display on each page. Defaults to 10.
* `pageNum` - the page number you want to retrieve the items of data for. Different APIs use different methods (and
parameters) for pagination, which is one of the reasons why the ReST Service exists independently of the implementation
 used to perform the actual API requests. Defaults to 1.
* `sortColumn` - the name of the column you wish you to sort on. No default. If you don't wish to sort, simply don't provide
 a `sortColumn` value.
* `sortAscending` - true returns the data sorted by sortColumn in ASCending order. False returns it sorted in DESCending
 order. No default - if you don't need to sort your data, simply don't provide a 'sortAscending' value.

*Return values*
* `getData()` must return a promise immediately after making the call to the ReST API. The promise must be chained with a
 then() function, which must return an array of items of length `itemsPerPage' or less.
 * On error, the response object must be returned.


###ReST Service getTotalItemsCount() Parameters###

#####getTotalItemsCount()#####

*Parameters*
None

*Return values*
* `getTotalItemsCount()` must return a promise immediately after making the call to the ReSTAPI. The promise must be chained
with a then() function, which must return the total number of items in the dataset that can be paginated.
 * On error, the response object must be returned.

##Example##

###Using the momPaginator in a controller###

```
angular.module('angularMomPaginatorApp', [
        'ngResource',
        'rest.ReSTService',   // change this to whatever ReST service you're using
        'momUI.momPaginator'])
 .controller('DemoAppCtrl', ['$scope', 'momPaginator', 'gitHubData', function($scope, momPaginator, gitHubData){
        $scope.model.paginator = momPaginator(gitHubData, 5, 1, {sortIconUp: 'glyphicon glyphicon-arrow-up',
            sortIconDown: 'glyphicon glyphicon-arrow-down', sortIconNone: 'glyphicon glyphicon-resize-vertical'});
        $scope.model.paginator.promise
            .then(function(){
                $scope.model.paginator.getPage()
                    .then(function(){
                        $scope.model.pages = getPageNumbers($scope.model.paginator.totalPagesCount);
                    })
            });
```

###Using the momPaginator to fill your HTML table with a page of data###

```
<table>
...
    <tr ng-repeat="item in model.paginator.currentPageItems">
        <td>{{item.property1}}</td>
        <td>{{item.property2}}</td>
        <td>{{item.property3}}</td>
    </tr>
</table>
```

###Adding pagination buttons to your HTML###

```
<div class="m-pagination-btns">
    <button class="btn btn-mini btn-primary sdr-pagination-prev-btn" ng-click="model.paginator.first()"><< First</button>
    <button class="btn btn-mini btn-primary sdr-pagination-prev-btn" ng-click="model.paginator.prev()">< Prev</button>
    <button class="btn btn-mini btn-primary sdr-pagination-prev-btn" ng-click="model.paginator.next()">Next ></button>
    <button class="btn btn-mini btn-primary sdr-pagination-next-btn" ng-click="model.paginator.last()">Last >></button>
</div>
```

##Complete Example##
To see a complete example implementation, clone the repo and navigate to:

 `http://localhost/angular-mom-paginator/app/#/`

###Files###

* The standard momPaginator home page is implemented in `app/views/main.html` and uses the `DemoAppCtrl`
 controller (defined in `angular-mom-paginator/app/scripts/app.js`)
* The version with the spinner is implemented in `app/views/main-spinner.html` and uses the `DemoAppSpinnerCtrl`
 controller (defined in `angular-mom-paginator/app/scripts/app.js`)
* The Paginator service is defined in 'angular-mom-paginator/app/scripts/services/paginator.js`
* The ReST Service is defined in `angular-mom-paginator/app/scripts/shared/gitHubAPI_module.js`

###Tests###
You'll need the Karma test runner to run the tests, which can be found in `angular-mom-paginator/test/spec`. Tests for
  the controllers can be found in `angular-mom-paginator/test/spec/controllers/main.js`, while the much more
  detailed tests for the ReST API communication can be found in
  `angular-mom-paginator/test/spec/shared/restAPIspec.js`

 Mocks of the Paginator service and gitHub results can be found in `angular-mom-paginator/test/mock`








