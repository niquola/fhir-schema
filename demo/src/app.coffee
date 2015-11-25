require('file?name=/index.html!jade-env-html!./index.jade')

require('ng-cache?!jade-env-html!./404.jade')
require('ng-cache?!jade-env-html!./_index.jade')
require('./app.less')
require('angular-ui-codemirror')

fhir = require('../../src/bundled.js')

app = angular.module('app', [
  'ngCookies'
  'ngRoute'
  'ngAnimate'
  'ui.codemirror'
])

app.run ($rootScope, $window) ->
  console.log('run')

app.config ($routeProvider) ->
  rp = $routeProvider
  rp.when '/',
    name: 'index'
    templateUrl: '_index.jade'
    controller: 'IndexCtrl'
    reloadOnSearch: false
  rp.otherwise templateUrl: '404.jade'



app.controller 'IndexCtrl', ($scope)->
  $scope.resource = '{"resourceType": "Patient", "name": {"given": ["John"]}}'
  $scope.update = ()->
    try
      resource = JSON.parse($scope.resource)
      $scope.parseError = null
      $scope.result = fhir.validate(resource)
    catch e
      $scope.parseError = e.toString()

  $scope.update()

  codemirrorExtraKeys = window.CodeMirror.normalizeKeyMap
    "Ctrl-Space": () ->
      $scope.$apply('doMapping()')

    Tab: (cm) ->
      cm.replaceSelection("  ")

  $scope.codemirrorConfig =
    lineWrapping: false
    lineNumbers: true
    mode: 'javascript'
    extraKeys: codemirrorExtraKeys,
    viewportMargin: Infinity
