'use strict'
const app = angular.module("companionApp", [
    'ui.router',
    'ui.bootstrap',
    'ngCookies',
    'ngMessages',
    'loginController',
    'logoutController',
    'dashController',
    'registerController',
    'fieldsController',
    'customerController',
    'modalController'

]);


app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');
    $stateProvider
        .state('about', {
            url: '/about',
            template: '<h2>This is the about page for my project</h2>'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'loginController'
        })
        .state('logout', {
            url: '/logout',
            controller: 'logoutController'
        })
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'views/dash.html',
            controller: 'dashController'

        })
        .state('register', {
            url: '/register',
            templateUrl: 'views/register.html',
            controller: 'registerController'
        })
        .state('fields', {
            url: '/fields',
            templateUrl: 'views/fields.html',
            controller: 'fieldsController'
        })
        .state('customers', {
            url: '/customers',
            templateUrl: 'views/customers.html',
            controller: 'customerController'
        })

}])
