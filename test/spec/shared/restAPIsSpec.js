'use strict';


describe('Paginator Service', function() {
    beforeEach(module('momUI.momPaginator', 'rest.gitHubAPI'));

    var paginator;

    beforeEach(inject(function(momPaginator, gitHubData) {
        paginator = momPaginator(gitHubData);
    }));


});


describe('Service: gitHubAPI', function () {

    // Setup $httpBackend mocks
    var $httpBackend, $rootScope, createController, mockedJsonData, mockedTotalCountJsonData, DemoAppCtrl,
        $controller, mockedJsonData_3Records, mockedTotalCount_3Records;

    // load the modules
    beforeEach(module('angularMomPaginatorApp', 'rest.gitHubAPI', 'mockedGitHubJSON', 'mockedGitHubTotalCountJson',
        'mockedGitHubJSON_3Records', 'mockedGitHubTotalCountJson_3Records', 'momUI.momPaginator'));

    beforeEach(inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        // Get hold of a scope (i.e. the root scope)
        $rootScope = $injector.get('$rootScope');

        // The $controller service is used to create instances of controllers
        $controller = $injector.get('$controller');

        mockedJsonData = $injector.get('gitHubJSON');
        mockedJsonData_3Records = $injector.get('gitHubJSON_3Records');
        mockedTotalCountJsonData = $injector.get('gitHubTotalCountJson');
        mockedTotalCount_3Records = $injector.get('gitHubTotalCountJson_3Records');


    }));


    it('should contain a gitHubREST service', inject(function(gitHubREST) {
        expect(gitHubREST).toBeDefined();
    }));

    it('should contain a gitHubData service', inject(function(gitHubData) {
        expect(gitHubData).toBeDefined();
    }));


    /***
     * Test the gitHubData.getPage() function
     */
    describe("gitHubData.getData() function", function(){
        var paginator;

        it("should format a url with per_page=3 in the querystring when getData(3) is called", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=3&q=followers:%3E%3D0').respond(mockedTotalCount_3Records.fakeData);
            $httpBackend.expectGET("https://api.github.com/search/users?page=1&per_page=3&q=followers:%3E%3D0");

            gitHubData.getData(3);
            $httpBackend.flush();
        }));

        it("should retrieve 3 items of data from fakeData when itemsPerPage is set to 3", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=3&q=followers:%3E%3D0').respond(mockedTotalCount_3Records.fakeData);

            gitHubData.getData(3).then(function(items){
                expect(items.length).toEqual(3);
            });
            $httpBackend.flush();
        }));

    });


    /***
     * Test the momPaginator.getPage() function
     */
    describe("momPaginator.getPage() function", function(){
        var paginator;

        it("should retrieve 10 items of data from fakeData when first intialised", inject(function(momPaginator, gitHubData) {
            // getTotalItemsCount URL:
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            // getData URL:
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);


            paginator = momPaginator(gitHubData);

            paginator.promise.then(function(){
                expect(paginator.pageExists(paginator.currentPageNum + 1)).toBeTruthy();
                paginator.getPage().then(function(items){
                    expect(paginator.currentPageItems.length).toEqual(10);
                });
            });
            $httpBackend.flush();
        }));

        it("should set currentPageItems to 3 items when only 3 items are returned (e.g. when downloading the last set of data",
            inject(function(momPaginator, gitHubData) {
                // getTotalItemsCount URL:
                $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

                paginator = momPaginator(gitHubData);
                // Flush paginator's initial call to https://api.github.com/users (we don't care about testing this here)
                $httpBackend.flush();

                // Artifically set itemsPerPage to 10
                paginator.itemsPerPage = 10;

                // getData URL:
                $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCount_3Records.fakeData);

                // Now test the getData() function to see if currentPageItems.length is correctly set to 3.
                paginator.getPage().then(function(responseVal){
                    expect(paginator.currentPageItems.length).toEqual(3);
                });
                $httpBackend.flush();
            }));

        it("should return the response's error message when an error occurs", inject(function(momPaginator, gitHubData) {
            // getTotalItemsCount URL:
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);

            paginator.promise.then(function(){
                $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0').respond(400, 'bad data');
                paginator.getPage().then(function(responseVal){
                    expect(responseVal.data).toEqual('bad data');
                });
            });
            $httpBackend.flush();
        }));

        it("should return an empty array when pageExists returns false", inject(function(momPaginator, gitHubData) {
            // getTotalItemsCount URL:
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);

            // getData URL:
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCount_3Records.fakeData);

            paginator.promise.then(function(){
                paginator.totalPagesCount = 0;
                paginator.getPage().then(function(responseVal){
                    expect(responseVal).toEqual([]);
                });
            });
            $httpBackend.flush();
        }));

    });


    describe("momPaginator.getTotalPageCount() function", function(){
        var paginator;

        beforeEach(inject(function(momPaginator, gitHubData){
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
            paginator = momPaginator(gitHubData);
        }));

        it("should return 0 pages when there are 0 items", function() {
            paginator.promise.then(function(){
                paginator.totalItemsCount = 0;
                expect(paginator.getTotalPagesCount()).toEqual(0);
            });
            $httpBackend.flush();
        });

        it("should return 20 pages when there are 20 items", function() {
            paginator.promise.then(function(){
                paginator.totalItemsCount = 20;
                expect(paginator.getTotalPagesCount()).toEqual(2);
            });
            $httpBackend.flush();
        });

        it("should return 3 pages when there are 21 items", function() {
            paginator.promise.then(function(){
                paginator.totalItemsCount = 21;
                expect(paginator.getTotalPagesCount()).toEqual(3);
            });
            $httpBackend.flush();
        });

        it("should return 0 pages when there are -1 items", function() {
            paginator.promise.then(function(){
                paginator.totalItemsCount = -1;
                expect(paginator.getTotalPagesCount()).toEqual(0);
            });
            $httpBackend.flush();
        });
    });

     /***
     * Test the Paginator.getTotalItemsCount() function
     */
    describe("Paginator.getTotalItemsCount() function", function(){
        var paginator;

        it("should have a totalItemsCount mock value of 1000 (from fakeData) when first intialised", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);


            paginator = momPaginator(gitHubData);
            $httpBackend.flush();
            expect(paginator.totalItemsCount).toEqual(1000);

        }));

        it("should have a totalItemsCount of zero when an error occurs in getTotalItemsCount", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(400, "bad data");
            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            expect(paginator.totalItemsCount).toEqual(0);
        }));

        it("should return a count of 0 when an error occurs in getTotalItemsCount", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(400, "bad data");

            paginator = momPaginator(gitHubData);
            paginator.getTotalItemsCount().then(function(count){
                expect(count).toEqual(0);
            });
            $httpBackend.flush();

            expect(paginator.totalItemsCount).toEqual(0);
        }));

    });

    /***
     * Test the Paginator.pageExists function
     */
    describe("Paginator pageExists function", function(){

        var paginator;

        it("should have more data when first called", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            expect(paginator.pageExists(1)).toBeTruthy();
        }));


        it("should not have more data with total_count set to 0", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond({"total_count": 0});

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            expect(paginator.pageExists(0)).toBeFalsy();
        }));

        it("should have more data with total_count set to 100, currentPageNum = 3, currentPageItems.length = 10", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond({"total_count": 100});

            paginator = momPaginator(gitHubData);
            paginator.currentPageNum = 3;
            paginator.currentPageItems = [1,1,1,1,1,1,1,1,1,1];
            $httpBackend.flush();

            expect(paginator.pageExists(4)).toBeTruthy();
        }));


        it("should NOT have more data with total_count set to 100, currentPageNum = 10, totalPagesCount = 11", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond({"total_count": 100});

            paginator = momPaginator(gitHubData);
            paginator.promise.then(function(){

                paginator.currentPageNum = 10;
                paginator.currentPageItems = [1,1,1,1,1,1,1,1,1,1];
                paginator.totalPagesCount = 10;

                expect(paginator.pageExists(11)).toBeFalsy();

            });
            $httpBackend.flush();
        }));


    });

    /***
     * Test the Paginator.next function
     */
    describe("Paginator next function", function(){

        var paginator;

        it("should successfully call another page of data when next is called and currentPageNum = 1, and set currentPageNum === 2", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            $httpBackend.when('GET', 'https://api.github.com/search/users?page=2&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?page=2&per_page=10&q=followers:%3E%3D0');
            paginator.next().then(
                function(){
                    expect(paginator.currentPageNum).toEqual(2);
                }
            );
            $httpBackend.flush();
        }));


        it("should fail to call another page of data using next() when at the end of the pages", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            paginator.totalItemsCount = 100;
            paginator.currentPageNum = 10;
            paginator.totalPagesCount = 10;


            paginator.next().then(
                function(items){
                    expect(items).toEqual([]);
                }
            );

        }));


        it("should succesfully retrieve the last page of data using next()", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            // getData URL:
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);


            paginator = momPaginator(gitHubData);

            paginator.promise.then(function(){
                expect(paginator.pageExists(paginator.currentPageNum + 1)).toBeTruthy();
                paginator.getPage().then(function(items){
                    paginator.totalItemsCount = 100;
                    paginator.totalPagesCount = 100;

                    paginator.currentPageNum = 9;
                    $httpBackend.when('GET', 'https://api.github.com/search/users?page=10&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
                    paginator.next().then(function(items){
                        expect(items.length).toEqual(10);
                    });
                });
            });
            $httpBackend.flush();
        }));
    });


    /***
     * Test the Paginator.prev function
     */
    describe("Paginator prev function", function(){

        var paginator;

        it("should successfully call another page of data when prev is called and currentPageNum = 5", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            paginator.totalItemsCount = 100;
            paginator.currentPageNum = 5;
            paginator.totalPagesCount = 10;

            $httpBackend.when('GET', 'https://api.github.com/search/users?page=4&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?page=4&per_page=10&q=followers:%3E%3D0');
            paginator.prev().then(
                function(){
                    expect(paginator.currentPageNum).toEqual(4);
                }
            );
            $httpBackend.flush();
        }));


        it("should fail to call another page of data using prev() when on page 1", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            paginator.totalItemsCount = 100;
            paginator.currentPageNum = 1;
            paginator.totalPagesCount = 10;

            paginator.prev().then(
                function(items){
                    expect(items).toEqual([]);
                }
            );

        }));


        it("should successfully call the first page of data when prev is called and currentPageNum = 2, and set currentPageNum to 1", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            paginator.totalItemsCount = 100;
            paginator.currentPageNum = 2;
            paginator.totalPagesCount = 10;

            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0');
            paginator.prev().then(
                function(){
                    expect(paginator.currentPageNum).toEqual(1);
                }
            );
            $httpBackend.flush();
        }));


    });


    /***
     * Test the Paginator.first() and Paginator.last() functions
     */
    describe("Paginator first and last functions", function(){

        var paginator;

        it("should call the first page when paginator.first() is called", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            paginator.totalItemsCount = 100;
            paginator.currentPageNum = 5;
            paginator.totalPagesCount = 10;

            $httpBackend.when('GET', 'https://api.github.com/search/users?page=4&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?page=4&per_page=10&q=followers:%3E%3D0');
            paginator.prev().then(
                function(){
                    expect(paginator.currentPageNum).toEqual(4);

                    $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
                    $httpBackend.expectGET('https://api.github.com/search/users?page=1&per_page=10&q=followers:%3E%3D0');
                    paginator.first().then(function(){
                        expect(paginator.currentPageNum).toEqual(1);
                    })
                }
            );
            $httpBackend.flush();
        }));

        it("should call the last page when paginator.last() is called", inject(function(momPaginator, gitHubData){
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();

            paginator.totalItemsCount = 100;
            paginator.currentPageNum = 5;
            paginator.totalPagesCount = 10;

            $httpBackend.when('GET', 'https://api.github.com/search/users?page=4&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?page=4&per_page=10&q=followers:%3E%3D0');
            paginator.prev().then(
                function(){
                    expect(paginator.currentPageNum).toEqual(4);

                    $httpBackend.when('GET', 'https://api.github.com/search/users?page=100&per_page=10&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);
                    $httpBackend.expectGET('https://api.github.com/search/users?page=100&per_page=10&q=followers:%3E%3D0');

                    paginator.totalPagesCount = 100;
                    paginator.last().then(function(){
                        expect(paginator.currentPageNum).toEqual(100);
                    })
                }
            );
            $httpBackend.flush();
        }));
    });

    /***
     * Test the Paginator.toggleSort() function
     */
    describe("Paginator.toggleSort() function", function(){

        var paginator;

        it("should set sortColumn = 'joined' and sortAscending =false when toggleSort(joined) is called", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();
            expect(paginator.sortAscending).toEqual(null);

            $httpBackend.when('GET', 'https://api.github.com/search/users?order=desc&page=1&per_page=10&q=followers:%3E%3D0&sort=joined').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?order=desc&page=1&per_page=10&q=followers:%3E%3D0&sort=joined');
            paginator.toggleSort("joined").then(
                function(){
                    expect(paginator.sortColumn).toEqual("joined");
                    expect(paginator.sortAscending).toEqual(false);
                }
            );
            $httpBackend.flush();
        }));

        it("should set sortColumn = 'joined' and sortAscending = true when toggleSort(joined) is called twice", inject(function(momPaginator, gitHubData) {
            $httpBackend.when('GET', 'https://api.github.com/search/users?page=1&per_page=1&q=followers:%3E%3D0').respond(mockedTotalCountJsonData.fakeData);

            paginator = momPaginator(gitHubData);
            $httpBackend.flush();
            expect(paginator.sortAscending).toEqual(null);

            $httpBackend.when('GET', 'https://api.github.com/search/users?order=desc&page=1&per_page=10&q=followers:%3E%3D0&sort=joined').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?order=desc&page=1&per_page=10&q=followers:%3E%3D0&sort=joined');
            paginator.toggleSort("joined").then(
                function(){
                    expect(paginator.sortColumn).toEqual("joined");
                    expect(paginator.sortAscending).toEqual(false);
                }
            );
            $httpBackend.flush();

            $httpBackend.when('GET', 'https://api.github.com/search/users?order=asc&page=1&per_page=10&q=followers:%3E%3D0&sort=joined').respond(mockedTotalCountJsonData.fakeData);
            $httpBackend.expectGET('https://api.github.com/search/users?order=asc&page=1&per_page=10&q=followers:%3E%3D0&sort=joined');
            paginator.toggleSort("joined").then(
                function(){
                    expect(paginator.sortColumn).toEqual("joined");
                    expect(paginator.sortAscending).toEqual(true);
                }
            );
            $httpBackend.flush();
        }));
    });


    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

});



