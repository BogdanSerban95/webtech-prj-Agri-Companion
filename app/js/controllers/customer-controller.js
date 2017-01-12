'use strict'
const customerController = angular.module('customerController', [
    'ui.router',
    'ngCookies',
    'ui.bootstrap'
])

customerController.controller('customerController', ['$scope', '$http', '$state', '$cookies', '$modal', function($scope, $http, $state, $cookies, $modal) {
    let token = $cookies.get("token");
    let constructor = () => {
        if (token != "") {
            $http.get(SERVER + '/customers?token=' + token)
                .then((response) => {
                    $scope.name = response.data.name;
                    $scope.customers = response.data.customers;

                })
                .catch((error) => {
                    console.log(error);
                })
            $http.get(SERVER + '/fields?token=' + token)
                .then((response) => {
                    $scope.allFields = response.data.fields;
                })
        }
        else {
            $state.go('login');
        }
    }


    $scope.deleteCustomer = (customer) => {
        $http.delete(SERVER + '/customers/' + customer.id + '?token=' + token)
            .then((response) => {
                $state.go($state.current, {}, {
                    reload: true
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    $scope.saveCustomer = (customer) => {
        $http.put(SERVER + '/customers/' + customer.id + '?token=' + token, customer)
            .then((response) => {
                $state.go($state.current, {}, {
                    reload: true
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    $scope.addCustomer = (customer) => {

        if (customer) {
            if (!customer.name) {
                alert("Insert customer name!");
            }
            else {
                if (!customer.personalNumber) {
                    alert("Insert customer personal number!");
                }
                else {
                    if (!customer.idNumber) {
                        alert("Insert customer ID card number!")
                    }
                    else {
                        $http.post(SERVER + '/customers?token=' + token, customer)
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

    $scope.selectedField = {
        customer: {},
        field: {}
    };

    $scope.getTemplate = (customer) => {
        if (customer.id == $scope.selected.id) {
            return 'edit';
        }
        else {
            return 'display';
        }
    }

    $scope.editCustomer = (customer) => {
        $scope.selected = customer;
    }

    $scope.cancelEditing = () => {
        $scope.selected = {};
    }

    $scope.editField = (field, customer) => {
        var modalInstance = $modal.open({
            templateUrl: 'views/field_info.html',
            controller: 'modalController',
            resolve: {
                field: () => {
                    return field;
                }
            }
        });
        modalInstance.result.
        then((field) => {

            if (!field.customer_field.area) {
                alert('Please insert field area!');
            }
            else {
                if (isNaN(field.customer_field.area)) {
                    alert('Please insert a numeric value for field area!');
                }
                else {
                    $http.put('/customer_fields?token=' + $cookies.get('token'), field)
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
        });
    };

    $scope.addField = (newField, customer) => {
        if (newField) {
            if (!newField.name) {
                alert("Please select a field name!\nWarning! You can add a field to a customer only once!")
            }
            else {
                if (!newField.area) {
                    alert("Please insert numeric data for area!");
                }
                else {
                    $http.post(SERVER + '/customer_fields?token=' + $cookies.get('token'), {
                            field: newField,
                            customer: customer
                        })
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

    $scope.deleteField = (field, customer) => {
        $http.delete(SERVER + '/customer_fields/' + field.id + "&" + customer.id + '?token=' + $cookies.get('token'))
            .then((response) => {
                $state.go($state.current, {}, {
                    reload: true
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }
    constructor();
}])
