'use strict'
const loginController = angular.module('loginController', [
    'ui.router',
    'ngCookies'
])

const SERVER = 'https://webtech-project-serbanbogdan.c9users.io';

loginController
    .controller('loginController', ['$scope', '$http', '$state', '$cookies', '$document', function($scope, $http, $state, $cookies, $document) {
        let constructor = () => {
            var token = $cookies.get("token");
            if (token != '' && token != null) {
                $state.go("dashboard");
            }
        }

        $scope.login = (user) => {
            if (user) {
                $http.post(SERVER + '/login', user)
                    .then((response) => {
                        if (response.status == 200) {
                            $cookies.put("token", response.data);
                            $state.go("dashboard");
                        }
                        else {
                            alert(response.data);
                        }

                    })
                    .catch((error) => {
                        console.log(error);
                    })
            }
        }
        $scope.register = () => {
            $state.go('register');
        }
        constructor();
    }]);
