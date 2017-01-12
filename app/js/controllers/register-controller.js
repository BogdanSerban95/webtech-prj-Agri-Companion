'use strict'
const registerController = angular.module('registerController', [
    'ui.router'
])

// const SERVER = 'https://webtech-project-serbanbogdan.c9users.io';

registerController.controller('registerController', ['$scope', '$http', '$state', function($scope, $http, $state) {
        $scope.toLogin = () => {
            $state.go('login');
        }

        $scope.register = (user) => {
            let okToRegister = true;
            if (!user) {
                alert('Please complete the fields!');
                okToRegister = false;
            }
            else {
                if (!user.name) {
                    alert('Please insert your name!');
                    okToRegister = false;
                }
                else {
                    if (!user.email) {
                        alert('Please insert your email!');
                        okToRegister = false;
                    }
                    else {
                        if (!user.username) {
                            alert('Please insert your username!');
                            okToRegister = false;
                        }
                        else {
                            if (!user.password) {
                                alert("Please insert your password!");
                                okToRegister = false;
                            }
                            else {
                                if (!user.passConfirm) {
                                    alert("Please insert your password for confirmation!");
                                    okToRegister = false;
                                }
                                else {
                                    if (user.passConfirm != user.password) {
                                        alert("Your passwords are not the same!");
                                        okToRegister = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (okToRegister) {
                delete user.passConfirm;
                $http.post('/signup', user)
                    .then((response) => {
                        alert(response.data);
                        $state.go('login', {});
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            }

        }

    }])
    .directive('checkUsername', ['$http', '$q', '$timeout', ($http, $q, $timeout) => {
        let directive = {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attr, ngModel) => {
                ngModel.$asyncValidators.invalidUsername = (modelValue, viewValue) => {
                    let username = modelValue;
                    let deferred = $q.defer();

                    $http.post(SERVER + '/checkUsername', {
                            username: username
                        })
                        .then((response) => {
                            console.log(response.data);
                            $timeout(() => {
                                if (response.data.exists) {
                                    deferred.reject();
                                }
                                else {
                                    deferred.resolve();
                                }
                            }, 500);
                        })
                        .catch((error) => {
                            console.log("eroare" + error);
                        });

                    return deferred.promise;
                }
            }
        }
        return directive;
    }])
    .directive('checkPass', [() => {
        let directive = {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attrs, ngModel) => {
                ngModel.$validators.unmatchingPassword = (modelValue, viewValue) => {
                    let firstPassInput = '#' + attrs.checkPass;
                    let pass = modelValue;
                    let validated = false;

                    if (pass == $(firstPassInput).val() || !pass) {
                        validated = true;
                    }
                    else {
                        validated = false;
                    }

                    return validated;
                }

            }
        }
        return directive;
    }])
    .directive('checkEmail', [() => {
        let directive = {
            restrict: 'A',
            require: "ngModel",
            link: (scope, element, attrs, ngModel) => {
                ngModel.$validators.invalidEmail = (modelValue, viewValue) => {
                    let email = modelValue;
                    let atPosition = email.indexOf('@');
                    let dotPosition = email.indexOf('.');
                    let validated = true;

                    if (atPosition < 1 || dotPosition < atPosition + 2 || dotPosition >= email.length) {
                        validated = false;
                    }
                    return validated;
                }
            }
        }

        return directive;
    }])
