'use strict';

angular.module('common', ['stats'])
  .controller('StatusBarController', function ($scope, $log, $location, ClusterState) {
    var colorMap = {"good": '',
                    "warning": 'label-warning',
                    "critical": 'label-danger',
                    '--': 'label-danger'};
    $scope.cluster_color_label = 'label-default';
    $scope.$watch( function () { return ClusterState.data; }, function (data) {
      $scope.version = data.version;
      $scope.cluster_state = data.status;
      $scope.cluster_name = data.name;
      $scope.cluster_color_label = colorMap[data.status];
      $scope.load1 = data.load[0]  == '-.-' ? data.load[0] : data.load[0].toFixed(2);
      $scope.load5 = data.load[1]  == '-.-' ? data.load[1] : data.load[1].toFixed(2);
      $scope.load15 = data.load[2] == '-.-' ? data.load[2] : data.load[2].toFixed(2);
    }, true);
  })
  .controller('NavigationController', function ($scope, $location, ClusterState) {
    var colorMap = {"good": '',
                    "warning": 'label-warning',
                    "critical": 'label-danger',
                    '--': 'label-danger'};

    // $scope.$watch( function () { return ClusterState.data; }, function (data) {
    //   $scope.cluster_color_label_bar = colorMap[data.status];
    // }, true);

    $scope.isActive = function (viewLocation) {
      if (viewLocation == '/') {
        return viewLocation === $location.path();
      } else {
        return $location.path().substr(0, viewLocation.length) == viewLocation;
      }
    };
  });
