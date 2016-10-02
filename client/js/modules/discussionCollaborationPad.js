angular.module('discussionCollaborationPad', ['ngSanitize'])

    .directive('collaborationPad', ['$rootScope', function($rootScope) {

        var collaborationPadController = function($scope,$sce){

            $scope.expandedcollaborationPad = false;

            $scope.currentPointedText = null;

            $scope.collabTabClass = "glyphicon glyphicon-blackboard btn btn-primary";

            $scope.markTextByRange = function(start,end){
                var prefix = $scope.content.substring(0,start),
                    marked = $scope.content.substring(start,end),
                    suffix = $scope.content.substring(end,$scope.content.length-1),
                    newContent;
                newContent = prefix + "<span style='background-color: #ffbf80'>" + marked + "</span>" + suffix;
                $scope.showContent = $sce.trustAsHtml(newContent);
                scrollPadToMarked(start);
            };

            function scrollPadToMarked(start){
                setTimeout(function(){
                    var content = document.getElementById("collaborationPadContent"),
                        len = $('#collaborationPadContent').text().length,
                        ratio = start/len;

                    content.scrollTop = content.scrollHeight * ratio * 0.9;
                },0)
            }

            $scope.$on('mark-text-in-pad-ctrl',function(e,data){
                if(!$scope.expandedcollaborationPad)
                    $scope.collaborationPadExpansionFlip();
                $scope.markTextByRange(data.start,data.end);
            });

            $scope.$on('shut-pad-ctrl',function(e){
                $scope.collaborationPadExpansionFlip();
            });

            $scope.collaborationPadExpansionFlip = function(){
                $scope.expandedcollaborationPad = !$scope.expandedcollaborationPad;
            };

            $scope.onPadTextSelection = function(){
                var mainDiv = document.getElementById("collaborationPadContent");
                var sel = getSelectionCharOffsetsWithin(mainDiv);
                //if(sel.end != sel.start)
                //    $rootScope.highlightedPadText = sel;
                $rootScope.highlightedPadText = sel;
                $scope.markTextByRange(sel.start,sel.end);
                //$scope.emit('new-pad-highlighted-text', sel);
                //alert(sel.start + ": " + sel.end);
            }

            function getSelectionCharOffsetsWithin(element) {
                var start = 0, end = 0;
                var sel, range, priorRange;
                if (typeof window.getSelection != "undefined") {
                    range = window.getSelection().getRangeAt(0);
                    priorRange = range.cloneRange();
                    priorRange.selectNodeContents(element);
                    priorRange.setEnd(range.startContainer, range.startOffset);
                    start = priorRange.toString().length;
                    end = start + range.toString().length;
                } else if (typeof document.selection != "undefined" &&
                    (sel = document.selection).type != "Control") {
                    range = sel.createRange();
                    priorRange = document.body.createTextRange();
                    priorRange.moveToElementText(element);
                    priorRange.setEndPoint("EndToStart", range);
                    start = priorRange.text.length;
                    end = start + range.text.length;
                }

                return {
                    start: start,
                    end: end
                };
            }

        }

        return{
            restrict: "E",
            controller: collaborationPadController,
            controllerAs: 'collabCtl',
            bindToController: true,
            templateUrl: "../partials/collaborationPad.html"
        }
    }])