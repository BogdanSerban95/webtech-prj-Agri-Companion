'use strict'
const modalController = angular.module('modalController', [
    'ui.router',
    'ngCookies',
    'ui.bootstrap'
])

modalController.controller('modalController', ['$scope', '$http', '$cookies', '$modalInstance', 'field', function($scope, $http, $cookies, $modalInstance, field) {
    let constructor = () => {
        $scope.field = field;
        console.log(field);
        $http.get(SERVER + '/fields?token=' + $cookies.get('token'))
            .then((response) => {
                $scope.fields = response.data.fields;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    $scope.save = (field) => {
        $modalInstance.close(field);
    }
    $scope.cancel = () => {
        $modalInstance.dismiss('cancel');
    }
    constructor();
}])
