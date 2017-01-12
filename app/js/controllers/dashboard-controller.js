'use strict'
const dashController = angular.module('dashController', [
    'ui.router',
    'ngCookies'
])

dashController.controller('dashController', ['$scope', '$http', '$state', '$cookies', function($scope, $http, $state, $cookies) {
    let constructor = () => {
        let token = $cookies.get("token");
        if (token != "") {
            var config = {
                params: {
                    token: token
                },
                headers: {
                    'Accept': 'application/json'
                }
            };
            $http.get(SERVER + '/user?token=' + token)
                .then((response) => {
                    if (response.status == 200) {
                        $scope.username = response.data;
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }else{
            $state.go('login');
        }
    }

    constructor();
}])
