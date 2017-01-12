'use strict'
const logoutController = angular.module('logoutController', [
    'ui.router',
    'ngCookies'
])

// const SERVER = 'https://webtech-project-serbanbogdan.c9users.io';

logoutController.controller('logoutController', ['$scope', '$http', '$state', '$cookies', function($scope, $http, $state, $cookies) {
    let constructor = () => {
        let token = $cookies.get("token");
        $http.post(SERVER + '/logout', {
                token: token
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => {
                $cookies.put("token", "");
                $state.go('login');

            })
            .catch((error) => {
                console.log(error);
            })
    }

    constructor();
}])
