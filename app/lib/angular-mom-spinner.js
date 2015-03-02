/* Directives */

'use strict';

// Declare app level module
angular.module('momUI', [])

/**
 * @momSpinner directive
 * @name momUI:momSpinner
 * @author: Mike Evans
 * @restrict E
 *
 * @description
 * The momSpinner directive defines the mom-spinner element, which replaces a starting icon with a spinning icon
 * whenever it is clicked or is triggered by a 'startSpinner' event.
 *
 * The element indicates to the user that an asynchronous function is working. Once this function completes, the
 * mom-spinner element's icon will return either to its original static icon, or to a new icon returned from the
 * asynchronous function.
 *
 * Unlike other spinner directives, you supply the asynchronous function to the mom-spinner element, passing in
 * the name of this function and its parameters as attributes to the mom-spinner element. When the
 * element is clicked (or a 'startSpinner' event is broadcast - see below), this asynchronous function is called and
 * the current icon is replaced with a spinning icon.
 *
 * The asynchronous function must return a promise, and it is the completion of the promise that stops the spinner.
 * The promise itself can return an icon name, and this icon will be displayed instead of the spinning icon (if the
 * promise does not return an icon value, the starting icon value will be used instead).
 *
 * The template used by the directive renders the icons via an i element. If you're using Twitter Bootstrap,
 * the icon name can therefore be any of Bootstrap's Glyphicon icons.
 *
 * You can remotely trigger each mom-spinner element by broadcasting a 'startSpinner' event with either a tag name
 * or an id. If you broadcast a startSpinner event with a spinnerTag parameter then every mom-spinner element with that
 * tag name will begin spinning. If you broadcast a startSpinner event with a spinnerId parameter then only that
 * mom-spinner element with that tag name will begin spinning.
 *
 * @usage
 * <mom-spinner
 *      mom-spinner-start-icon="startIcon"
 *      mom-spinner-icon="spinnerIcon"
 *      mom-spinner-fn="asynchronousFunction"
 *      mom-spinner-fn-params="{name1: value1, name2: value2...nameN: valueN}"
 *      mom-spinner-tag="spinnerTag"
 *      mom-spinner-id="spinnerId">
 * </mom-spinner>
 *
 * @scope
 * @priority 800
 * @default Default spinner icon: "icon-spin icon-refresh" (requires font-awesome stylesheet:
 *                          http://netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome.css)
 * @listens module:mom-spinner#startSpinner
 * @paramDescription
 * On the mom-spinner element add:
 *
 * * `mom-spinner-start-icon`: the icon that should appear before the asynchronous function is called. The name should be
 *   a Twitter Bootstrap icon name.
 * *  'mom-spinner-icon': the icon to use when the asynchronous function has been called but not yet returned. The name
 *   should be a Twitter Bootstrap icon name.
 * * `mom-spinner-fn`: the asynchronous function to call when this mom-spinner element is clicked.
 * * 'mom-spinner-fn-params': an object of name:value pairs that can be used to pass parameters to the asynchronous
 *   function. The naming, meaning and number of parameters is up to you and depends on the requirements of the
 *   asynchronous function you specify.
 * * 'mom-spinner-tag': tag this mom-spinner element with this value. Many mom-spinner elements can be given the same
 *   tag. When the tag is triggered via the startSpinner event, all mom-spinners with the same tag will execute their
 *   asynchronous functions and display their respective spinning icons. Note that despite having the same tag, each
 *   such mom-spinner element can have a different asynchronous function and spinning icon.
 * * 'mom-spinner-id': identifies this element uniquely. A startSpinner event can trigger this mom-spinner element
 *   and only this mom-spinner element.
 *
 * @example
 <mom-spinner
        mom-spinner-start-icon="'glyphicon glyphicon-ok'"
        mom-spinner-fn="model.asyncFn"
        mom-spinner-fn-params="{'icon-end':'glyphicon glyphicon-ok-sign', 'cell-name': 'Joe Bloggs'}"
        mom-spinner-tag="'icon-spin icon-refresh'">
 </mom-spinner>
 */
.directive('momSpinner', function(){
    return{
        restrict: "E",
        transclude: false,
        replace: true,
        scope: {
            momSpinnerIcon: '@momSpinnerIcon',
            momSpinnerFn: '&momSpinnerFn',
            momSpinnerFnParams: '&momSpinnerFnParams',
            momSpinnerStartIcon: '=',
            momSpinnerTag: '@momSpinnerTag',
            momSpinnerId: '@momSpinnerId'
        },
        // The controller is gitHubAPI with all other momSpinner directives
        controller: function($scope, $element, $attrs){
            $scope.momSpinnerClicked = function(args){

                // Setup the spinner function
                var expressionHandler = $scope.momSpinnerFn();
                if(typeof expressionHandler === 'undefined'){
                    console.log("Spinner directive: mom-spinner-fn attribute not defined.");
                    return;
                }


                // Setup the spinner function's parameters
                // ---------------------------------------

                // Note: You need to do this to evaluate the params - otherwise they'll be treated as a string,
                // not an object
                var params = $scope.momSpinnerFnParams();

                // Merge the args passed to momSpinnerClicked with the params passed via the momSpinnerFnParams
                // attribute in the HTML
                if(typeof args !=='undefined'){
                    if(typeof params === 'undefined'){
                        params = args;
                    }
                    else{
                        angular.forEach(args, function(value, key){
                            params[key] = value;
                        });
                    }
                }

                // Set the spinner spinning
                var oldIcon = $scope.theIcon;
                $scope.momSpinnerIcon = (typeof $scope.momSpinnerIcon === 'undefined') ? "icon-spin icon-refresh" : $scope.momSpinnerIcon;
                $scope.theIcon = $scope.momSpinnerIcon;

                // Call the mom-spinner-fn
                // -----------------------
                var promise = expressionHandler(params);
                if(typeof promise ===  'undefined' || !('then' in promise)){
                    console.log("Warning - no promise returned from mom-spinner-fn");
                    return;
                }
                promise.then(
                    // Success
                    function(responseVal){
                        // Stop the spinner
                        if(typeof responseVal === 'undefined' || !('icon' in responseVal) || responseVal.icon === null){
                            console.log("Spinner directive: Promise has not returned a value for the stop icon. Using the start icon as default instead.");
                            $scope.theIcon = oldIcon;
                        }
                        else{
                            $scope.theIcon = responseVal.icon;
                        }
                        return responseVal;
                    },
                    // Failure
                    function(responseVal){
                        // Stop the spinner
                        if(typeof responseVal === 'undefined' || !('icon' in responseVal) || responseVal.icon === null){
                            console.log("Spinner directive: Promise returned error: ");
                            console.dir(responseVal);
                            $scope.theIcon = oldIcon;
                        }
                        else{
                            $scope.theIcon = responseVal.icon;
                        }
                        return responseVal;

                    });
                return promise;

            };

            /**
             * Spinner event.
             *
             * @event mom-spinner#startSpinner
             * @type {object}
             * @property {string} spinnerIdentifier - can be either a mom-spinner element's tag name or id
             *
             * @property {object} params - hash representing parameters that are passed to the mom-spinner-fn.
             */
            $scope.$on('startSpinner', function(event, spinnerIdentifier, params){
                if((    'spinnerTag' in spinnerIdentifier && spinnerIdentifier.spinnerTag === $scope.momSpinnerTag)
                    ||  'spinnerId' in spinnerIdentifier && spinnerIdentifier.spinnerId === $scope.momSpinnerId){
                    return $scope.momSpinnerClicked(params);
                }
            })
        },
        link: function(scope, element, attrs){
            // Initialise the icon and set the spinner icon
            scope.theIcon = scope.momSpinnerStartIcon;
            scope.momSpinnerIcon = (typeof scope.momSpinnerIcon === 'undefined') ? "icon-spin icon-refresh" : scope.momSpinnerStartIcon;
        },
        template: "<span class='mom-spinner' ng-click='momSpinnerClicked()'><i class='{{theIcon}}'></i></span>"

    }
});
