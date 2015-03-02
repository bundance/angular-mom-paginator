'use strict';

describe('Controller: DemoAppCtrl', function () {

    var DemoAppCtrl,
        paginator,
        scope;

    /**
     * Jasmine custom matcher for deep matching objects
     * @param k
     * @param v
     * @returns {*}
     */
    function replacer(k, v) {
        if (typeof v === 'function') {
            v = v.toString();
        } else if (window['File'] && v instanceof File) {
            v = '[File]';
        } else if (window['FileList'] && v instanceof FileList) {
            v = '[FileList]';
        }
        return v;
    }

    beforeEach(function(){
        this.addMatchers({
            toBeJsonEqual: function(expected){
                var one = JSON.stringify(this.actual, replacer).replace(/(\\t|\\n)/g,''),
                    two = JSON.stringify(expected, replacer).replace(/(\\t|\\n)/g,'');

                return one === two;
            }
        });
    });


    // load the controller's module
    beforeEach(module('angularMomPaginatorApp'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, momPaginator, gitHubData) {
        scope = $rootScope.$new();
        DemoAppCtrl = $controller('DemoAppCtrl', {
            $scope: scope,
            momPaginator: momPaginator,
            gitHubData: gitHubData
        });

    }));

    //it('Should define paginator on the scope', function () {
    //    expect(scope.paginator).toBeDefined();
    //});
    //
    //it("Should define model on the scope", function(){
    //    expect(scope.model).toBeJsonEqual({
    //        page: 1,
    //        pages: []
    //    });
    //})


});

