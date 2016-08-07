/*
 BASED ON TREE-STRUCTURE-TEMPLATE BY:
 @Author Angular TreeWidget version 1.0.1
 ⓒ 2016 Alex Suleap https://github.com/AlexSuleap/agular-tree-widget
 @license: MIT
 */

(function () {
    'use strict';
    angular.module('TreeWidget', ['ngAnimate', 'RecursionHelper','ngSanitize'])
        .directive('overflowContent', function($timeout){
            function link($scope, $element, $attrs, $ctrl){
                $scope.$watch('nodeChanged', function(){
                    $timeout(function() {

                        //check for content length
                        var elm2 = $element.clone();
                        elm2.css({display: 'inline', width: 'auto', visibility: 'hidden'});
                        elm2.appendTo('body');

                        //enable expansion of content when the text overflows or there is a newline
                        if ((elm2.width() > $element.width()) || ($ctrl.node.content.indexOf("\n") != -1)) {
                            //don't expand hidden nodes
                            $scope.expandContent = true;
                        }
                        else
                            $scope.expandContent = false;

                        elm2.remove();
                    },300)
                },true);
            }

            function overflowController($scope, $element, $filter, $sce){
                var vm = this;
                $scope.nodeChanged = vm.node;

                var res = "** תוכן הוסתר על ידי המנהל :( **";
                res = "<span style='color:red;'>" + res + "</span>";
                res = $sce.trustAsHtml(res);

                $scope.hiddenMessage = res;

                vm.expand = function(event){

                    //When called by a link press - should NOT expand or collapse
                    if(event.target.tagName == "A")
                        return;
                    //--

                    if (!$scope.expanded){
                        $element.removeClass('non-expanded');
                        $element.addClass('expanded');
                        $scope.expanded = true;
                    }
                    else{
                        $element.removeClass('expanded');
                        $element.addClass('non-expanded');
                        $scope.expanded = false;
                    }
                };

                vm.iconFlashFlip = function(node){
                    node.iconHovering = !node.iconHovering;
                };

                vm.isChildHovered = function(children){
                    var res = "";
                    if(children != null)
                        for (var i = 0; i < children.length; i++)
                            if(children[i].iconHovering)
                                res = "iconFlash";
                    return res;
                };
            }

            return {
                strict:'A',
                scope:{node:'=',role:'='},
                template:
                    '<span>' +
                        '<span ng-mouseover="ofCtrl.iconFlashFlip(ofCtrl.node)" ng-mouseleave="ofCtrl.iconFlashFlip(ofCtrl.node)" title = " הודעה מאת: {{::ofCtrl.node.fname}} {{::ofCtrl.node.lname}}"' +
                        'ng-style="{color: ofCtrl.node.color}" class="glyphicon glyphicon-user" ng-class="ofCtrl.isChildHovered(ofCtrl.node.sub_arguments)"></span> ' +
                        '&nbsp;' +
                        '<span ng-if="ofCtrl.node.hidden" ng-bind-html="hiddenMessage"></span>' +
                        '<span ng-if="expandContent && !ofCtrl.node.hidden" style="cursor: pointer; cursor: hand;" ng-click="ofCtrl.expand($event)" ng-bind-html="ofCtrl.node.content | linky:\'_blank\'"> </span>' +
                        '<span ng-if="!expandContent && !ofCtrl.node.hidden" ng-bind-html="ofCtrl.node.content | linky:\'_blank\'"> </span>' +
                    '</span>',
                controller: overflowController,
                controllerAs: 'ofCtrl',
                bindToController: true,
                link:link
            }
        })



        .directive('tree', function () {
            return {
                restrict: "E",
                scope: { nodes: '=', role:'=', options: '=?'},
                template: "<treenode nodes='nodes' tree='nodelist' role='role' options='options' ></treenode>",
                //pre function compiles before the template, that's where we get the nodelist from
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

                vm.submitNewReply = function(node){
                    if (vm.replyText){
                        $scope.$emit('submitted-new-reply', {node: node, replyText: vm.replyText});
                        node.replyPressed = false;
                        node.expanded = true;
                    }
                };

                vm.newReplyPressed = function(node){
                    vm.replyText = "";
                    node.replyPressed = !node.replyPressed;
                };

                vm.flipArgumentHiddenStatus = function(node){
                    var argumentID = node._id;
                    $scope.$emit('flip-argument-hidden-status', {_id : argumentID});
                };

                vm.cancelReply = function(node){
                    node.replyPressed = false;
                };

                vm.prettyDate = function(date){
                    // return moment(date).startOf('hour').fromNow();
                    return moment(date).format('MMMM Do YYYY, h:mm a');
                };
            };

            return {
                restrict: "E",
                scope: { nodes: '=', tree: '=', options: '=?' , role:'='},
                controller: nodeController,
                controllerAs: 'nodeCtrl',
                bindToController: true,
                templateUrl: '../partials/treenode.html',
                compile: function (element) {
                    // from the recursion sevice...
                    return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                        /* Expand/Collapse node. Now this functionality is not used... */
                        scope.toggleNode = function (node) {
                            if (node.sub_arguments !== undefined) {
                                node.expanded = !node.expanded;
                            }
                        };
                    });
                }
            };
        }]);

})();
