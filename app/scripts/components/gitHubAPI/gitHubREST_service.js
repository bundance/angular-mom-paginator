angular.module('rest.gitHubAPI')
    .factory('gitHubREST', ['$resource', function ($resource) {
        return $resource('https://api.github.com/:action/:entity',
            {
                // @id=1
            },
            {
                // Call https://api.github.com/search/users?q=followers:>=0
                getData: {
                    method: 'GET',
                    isArray: false,
                    params: {
                        entity: 'users',
                        'q': 'followers:>=0',
                        action: 'search'
                    }
                }
            }
        );
    }]);
