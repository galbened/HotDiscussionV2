/*
  BASED ON TREE-STRUCTURE-TEMPLATE BY:
    @Author Angular TreeWidget version 1.0.1
    ⓒ 2016 Alex Suleap https://github.com/AlexSuleap/agular-tree-widget
    @license: MIT
*/

(function () {
  'use strict';
  angular.module('TreeWidget', ['ngAnimate', 'RecursionHelper'])
    .directive('tree', function () {
      return {
        restrict: "E",
        scope: { nodes: '=', options: '=?' },
        template: "<treenode nodes='nodes' tree='nodelist' options='options'></treenode>",
        compile: function compile(tElement, tAttrs, transclude) {
          return {
            pre: function (scope) {
              // console.log('compiling the tree directive. ');
              scope.nodelist = scope.nodes;
              scope.options = scope.options || (scope.options = { showIcon: true, expandOnClick: false, multipleSelect: false });
              scope.$watch(function () {
                //debug@@
                // console.log('watched!');
                // generateNodeList(scope.nodes);
                (function(){return scope.nodes;})();
              });
            }
          };
        }
      };
    })
    .directive('treenode', ['RecursionHelper', function (RecursionHelper) {
      var nodeController = function($scope){
        var vm = this;
        
        vm.submitNewReply = function(node, replyText){
          if (vm.replyText){
            $scope.$emit('submitted-new-reply', {node: node, replyText: vm.replyText});
            node.replyPressed = false;
            node.expanded = true;
          }
        };

        vm.newReplyPressed = function(node){
          vm.replyText = "";
          node.replyPressed = true;
        };

        vm.cancelReply = function(node){
          node.replyPressed = false;
        };
      };

      return {
        restrict: "E",
        scope: { nodes: '=', tree: '=', options: '=?' },
        controller: nodeController,
        controllerAs: 'nodeCtrl',
        bindToController: true,
        templateUrl: '../partials/treenode.html',
        compile: function (element) {
          // from the recursion sevice...
          return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
            /* Expand/Collapse node */
            scope.toggleNode = function (node) {
              if (node.sub_arguments !== undefined) {
                node.expanded = !node.expanded;
                // scope.$emit('expanded-state-changed', node);
              }
            };
          });
        }
      };
    }]);

})();
