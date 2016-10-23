/*
 BASED ON TREE-STRUCTURE-TEMPLATE BY:
 @Author Angular TreeWidget version 1.0.1
 ⓒ 2016 Alex Suleap https://github.com/AlexSuleap/agular-tree-widget
 @license: MIT
 */

(function () {
    'use strict';
    angular.module('TreeWidget', ['ngAnimate', 'RecursionHelper','ngSanitize','ui.tinymce'])
        .directive('overflowContent', function($compile){

            /*
            function link($scope, $element, $attrs, $ctrl){
                    $timeout(function() {
                        //check for content length
                        var elm2 = $element.clone();
                        elm2.css({display: 'inline', width: 'auto', visibility: 'hidden'});
                        elm2.appendTo('body');

                        //enable expansion of content when the text overflows or there is a newline
                        if ((elm2.width()+ 24 > $element.width()) || ($ctrl.node.content.indexOf("\n") != -1)) {
                            //don't expand hidden nodes
                            $scope.expandContent = true;
                        }
                        else
                            $scope.expandContent = false;

                        elm2.remove();
                    },300)
            }
             */

            function overflowController($scope, $element, $filter, $sce){
                var vm = this;

                vm.node.content = vm.node.content.replace(/<br[^>]*>/gi, "\n");

                var res = "** תוכן הוסתר על ידי המנהל :( **";
                res = "<span style='color:red;'>" + res + "</span>";
                res = $sce.trustAsHtml(res);

                $scope.hiddenMessage = res;

                vm.expand = function(event){

                    //When called by a link press - should NOT expand or collapse
                    if((event.target.tagName == "A")||(event.target.tagName == "BUTTON"))
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

                vm.calcElementExpansion = function(node){
                    if (($element[0].scrollWidth > $element[0].offsetWidth)  || (node.content.indexOf("\n") != -1)){
                        $scope.expandContent = true;
                    }
                }

                vm.emitParentBlinker = function(parentID){
                    if(parentID)
                        $scope.$emit('parentBlinker',{parentID:parentID});
                }


                vm.markPad = function(start,end) {
                    var data = {arg_id:vm.node._id,start:start,end:end};
                    $scope.$emit('mark-text-in-pad', data);
                    //console.log("start:" + start + " end: " + end + "yooooo");
                }
            }

            return {
                strict:'A',
                scope:{node:'=',role:'='},
                template:
                    '<span>' +
                        '<span ng-mouseover="ofCtrl.emitParentBlinker(ofCtrl.node.parent_id)" ng-mouseleave="ofCtrl.emitParentBlinker(ofCtrl.node.parent_id)" title = " הודעה מאת: {{::ofCtrl.node.fname}} {{::ofCtrl.node.lname}}"' +
                        'ng-style="{color: ofCtrl.node.color}" class="glyphicon glyphicon-user" ng-class="{\'iconFlash\' : ofCtrl.node.isBlinking}"></span> ' +
                        '&nbsp;' +
                        '<span ng-mouseover="ofCtrl.calcElementExpansion(ofCtrl.node)">' +
                            //when admin hides the node
                            '<span ng-if="ofCtrl.node.hidden"  ng-bind-html="hiddenMessage"></span>' +
                            //when node is expandable and not hidden
                            '<span ng-if="expandContent && !ofCtrl.node.hidden" style="cursor: pointer; cursor: hand;" ng-click="ofCtrl.expand($event)" dynamic="ofCtrl.node.content"> </span>' +
                            '<!--span ng-if="!expandContent && !ofCtrl.node.hidden" ng-bind-html="ofCtrl.node.content | linky:\'_blank\'"> </span-->' +
                            //when node is not expandable and not hidden
                            '<span ng-if="!expandContent && !ofCtrl.node.hidden" dynamic="ofCtrl.node.content"> </span>' +
                        '</span>' +
                    '</span>',
                controller: overflowController,
                controllerAs: 'ofCtrl',
                bindToController: true,
                //link:link
            }
        })
        .filter('unsafe', function($sce) { return $sce.trustAsHtml; })

        .directive('dynamic', function ($compile) {
            return {
                restrict: 'A',
                replace: true,
                link: function (scope, element, attrs) {
                    scope.$watch(attrs.dynamic, function(html) {
                        element.html(html);
                        $compile(element.contents())(scope);
                    });
                }
            };
        })

        .directive('nodeStyle', function () {
            return {
                restrict: 'A',
                scope: {role: '=', trimmed: '='},
                link: function (scope, element, attrs) {

                    var bgcolor, hoverbgcolor;
                    switch (scope.role) {
                        case 'student':
                            bgcolor = "rgba(235, 235, 235, 1)";
                            hoverbgcolor = "rgba(235, 235, 235, 0.6)";
                            break;
                        case 'admin':
                        case 'adminFromStudent':
                            bgcolor = "rgba(55, 251, 153, 1)";
                            hoverbgcolor = "rgba(55, 251, 153, 0.6)";
                            break;
                        case 'adminFromInstructor':
                            bgcolor = "rgba(120, 229, 237, 1)";
                            hoverbgcolor = "rgba(120, 229, 237, 0.6)";
                            break;
                        case 'instructor':
                            bgcolor = "rgba(255, 255, 204, 1)";
                            hoverbgcolor = "rgba(255, 255, 204, 0.6)";
                            break;
                        case 'moderator':
                            bgcolor = "rgba(255, 128, 128, 1)";
                            hoverbgcolor = "rgba(255, 128, 128, 0.6)";
                            break;
                    }

                    var defaultBackground;
                    if(scope.trimmed)
                        defaultBackground = "repeating-linear-gradient(90deg," + bgcolor + "," + bgcolor + " 10px," + hoverbgcolor + " 10px," + hoverbgcolor + " 20px)";
                    else
                        defaultBackground = bgcolor;

                    element.css("background",defaultBackground);

                    scope.$watch('trimmed', function(){
                        if(scope.trimmed)
                            defaultBackground = "repeating-linear-gradient(90deg," + bgcolor + "," + bgcolor + " 10px," + hoverbgcolor + " 10px," + hoverbgcolor + " 20px)";
                        else
                            defaultBackground = bgcolor;
                        element.css("background",defaultBackground);
                    });

                    element
                        .on('mouseenter',function() {
                            element.css('background-color', hoverbgcolor);
                        })
                        .on('mouseleave',function() {
                            element.css('background', defaultBackground);
                        });
                }
            }
        })


        .directive('tree', function () {
            return {
                restrict: "E",
                scope: { nodes: '=', role:'=', locked:'=', options: '=?'},
                template: "<treenode locked='locked' nodes='nodes' tree='nodelist' role='role' options='options'></treenode>",
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
        .directive('treenode', ['RecursionHelper','$rootScope', function (RecursionHelper,$rootScope) {
            var nodeController = function($scope){
                var vm = this;

                $scope.tinymceOptions = {

                    //just for placeholder
                    setup: function(editor) {
                        editor.addButton('mybutton', {
                            text: 'PAD',
                            icon: false,
                            onclick: function () {
                                var highlightLen = $rootScope.highlightedPadText.end - $rootScope.highlightedPadText.start;
                                if(highlightLen == 0){
                                    alert("לא נבחר טקסט מתוך המאמר.");
                                }
                                else{
                                    var selectedContent = tinymce.activeEditor.selection.getContent();
                                    editor.insertContent('&nbsp;<button class="btn btn-xs btn-info" ng-click="ofCtrl.markPad(' +
                                        $rootScope.highlightedPadText.start + ',' + $rootScope.highlightedPadText.end +
                                        ')">' + selectedContent +'</button>&nbsp;');
                                }
                            }
                        });
                    },

                    forced_root_block : "",
                    selector: 'div.tinymce',
                    theme: 'inlite',
                    inline: true,
                    plugins: "autolink textcolor",
                    extended_valid_elements : "a[href|target=_blank]",
                    selection_toolbar: 'bold italic underline forecolor | quicklink mybutton',
                    invalid_elements : 'img[*]',
                    valid_elements : 'a[href|target=_blank],strong/b,br,em,span[*],button[*]',
                    valid_styles: {
                        'span': 'text-decoration,color'
                    }
                };

                vm.focusOnNode = function(node){
                    $scope.$emit('focus-on-node', {node : node});
                };

                vm.getPostUserInfo = function(node){
                    //node.userInfo = "טוען.."
                    $scope.$emit('request-user-info-update', node);
                };

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

                vm.flipArgumentTrimmedStatus = function(node){
                    var argumentID = node._id;
                    $scope.$emit('flip-argument-trimmed-status', {_id : argumentID});
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
                scope: { nodes: '=', tree: '=', options: '=?' , role:'=', focusing:'=', locked:"="},
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
