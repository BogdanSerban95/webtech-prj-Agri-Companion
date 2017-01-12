'use strict'
const fieldsController = angular.module('fieldsController', [
    'ui.router',
    'ngCookies'
])

fieldsController.controller('fieldsController', ['$scope', '$http', '$state', '$cookies', function($scope, $http, $state, $cookies) {
    let token = $cookies.get("token");
    let constructor = () => {
        if (token != "") {
            $http.get(SERVER + '/fields?token=' + token)
                .then((response) => {
                    $scope.name = response.data.name;
                    $scope.fields = response.data.fields;
                    // $scope.index = 0;
                })
                .catch((error) => {
                    console.log(error);
                })
        }
        else {
            $state.go('login');
        }
    }


    $scope.deleteField = (field) => {
        $http.delete('/fields/' + field.id + '?token=' + token)
            .then((response) => {
                $state.go($state.current, {}, {
                    reload: true
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    $scope.saveField = (field) => {
        if (!field) {
            alert("Insert field info!");
        }
        else {
            if (!field.name) {
                alert('Insert field name!');
            }
            else {
                if (!field.surface) {
                    alert('Please insert field area!');
                }
                else {
                    if (isNaN(field.surface)) {
                        alert('Please insert a numeric value for field area!');
                    }
                    else {
                        $http.put('/fields/' + field.id + '?token=' + token, field)
                            .then((response) => {
                                $state.go($state.current, {}, {
                                    reload: true
                                })
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                    }
                }
            }
        }
    }

    $scope.addField = (field) => {
        if (!field) {
            alert("Insert field info!");
        }
        else {
            if (!field.name) {
                alert('Insert field name!');
            }
            else {
                if (!field.surface) {
                    alert('Please insert field area!');
                }
                else {
                    if (isNaN(field.surface)) {
                        alert('Please insert a numeric value for field area!');
                    }
                    else {
                        $http.post(SERVER + '/fields?token=' + token, field)
                            .then((response) => {
                                $state.go($state.current, {}, {
                                    reload: true
                                })
                            })
                    }
                }
            }
        }
    }
    $scope.selected = {};

    $scope.getTemplate = (field) => {
        if (field.id == $scope.selected.id) {
            return 'edit';
        }
        else {
            return 'display';
        }
    }

    $scope.editField = (field) => {
        $scope.selected = field;
    }

    $scope.cancelEditing = () => {
        $scope.selected = {};
    }

    constructor();
}])
