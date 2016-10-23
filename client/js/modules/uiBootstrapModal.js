angular.module('bootstrapModalApp', ['ngAnimate', 'ui.bootstrap']);
angular.module('bootstrapModalApp').controller('ModalCtrl', function ($scope, $uibModal, $log) {

    $scope.animationsEnabled = true;

    var socket = $scope.socket;

    $scope.open = function () {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/userInfoInput.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                socket: function () {
                    return socket;
                }
            }
        })
    };

    $scope.openPM = function (index) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/pmInput.html',
            controller: 'pmModalCtrl',
            size: 'sm',
            resolve: {
                socket: function () {
                    return socket;
                },
                group_id: function (){
                    return $scope.users_groups[index]._id;
                }
            }
        })
    };

    $scope.enterContent = function (index) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/enterDiscContent.html',
            controller: 'enterContentCtrl',
            size: 'lg',
            resolve: {
                socket: function () {
                    return socket;
                },
                discID: function (){
                    return $scope.discussions[index]._id;
                }
            }
        })
    };

    $scope.presentDiscussionNetworkGraph = function () {

        var argsMap = $scope.getArgsMap();

        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/discussionNetwork.html',
            controller: 'discussionNetworkGraphCtrl',
            size: 'lg',
            resolve: {
                argsMap: function (){
                    return argsMap;
                }
            }
        })
    };

    $scope.copyConfirmationModal = function (index) {
        $uibModal.open({
            animation: false,
            templateUrl: '../partials/copyConfirmationModal.html',
            controller: 'copyConfirmationModalCtrl',
            size: 'sm',
            resolve: {
                discID: function (){
                    return $scope.discussions[index]._id;
                },
                copyDiscussionFunc: function (){
                    return $scope.copyDiscussion;
                }
            }
        })
    };

    socket.on('sending-pm',function(data){

        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '../partials/pmShow.html',
            controller: 'pmShowModalCtrl',
            size: 'sm',
            resolve: {
                socket: function () {
                    return socket;
                },
                body: function (){
                    return data.body;
                }
            }
        })
    });
});

angular.module('bootstrapModalApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance ,socket) {

    $scope.userInfo = "";

    socket.on('sending-user-info',function(data){
        $scope.userInfo = data.userInfo;
    });

    socket.emit('requesting-user-info');

    $scope.ok = function () {
        socket.emit('updating-user-info', {userInfo:$scope.userInfo})
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp').controller('pmModalCtrl', function ($scope, $uibModalInstance ,socket, group_id) {

    $scope.ok = function () {
        socket.emit('new-pm', {group_id:group_id,body:$scope.pmText});
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp').controller('pmShowModalCtrl', function ($scope, $uibModalInstance ,socket, body) {

    $scope.body = body;

    $scope.ok = function () {
        //socket.emit('new-pm', {group_id:group_id,body:$scope.pmText});
        $uibModalInstance.close();
    };
});

angular.module('bootstrapModalApp').controller('copyConfirmationModalCtrl', function ($scope, $uibModalInstance, discID, copyDiscussionFunc) {

    $scope.ok = function () {
        copyDiscussionFunc(discID);
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp').controller('enterContentCtrl', function ($scope, $uibModalInstance ,socket, discID) {

    socket.on('sending-discussion-content',function(data){
        $scope.content = data.content;
        if(data.content != null)
            $("#saveContentButton").attr('disabled',true);
    });

    socket.emit('requesting-discussion-content', {disc_id:discID});

    $scope.ok = function () {
        socket.emit('update-discussion-content', {content:$scope.content, disc_id:discID});
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('bootstrapModalApp').controller('discussionNetworkGraphCtrl', function ($scope, $uibModalInstance, argsMap) {

    var users = {};
    var argByUser = {};
    var userToUserCount = {};

    for(var key in argsMap){
        if (argsMap.hasOwnProperty(key)) {
            var name = argsMap[key].fname + " " + argsMap[key].lname;
            name = name.substr(0,8);
            users[argsMap[key].user_id] = {"user_id":argsMap[key].user_id, "name":name, "color":argsMap[key].color};
            argByUser[argsMap[key]._id] = argsMap[key].user_id;

        }
    }

    var nodes = [];
    var edges = [];

    for(var key in users){
        if (users.hasOwnProperty(key)) {
            var nodeJson = {"id":users[key].user_id,"label": users[key].name,"color":users[key].color,"circle":"square","shadow":true,
                             "scaling": {"label":{"enabled": true}}};
            nodes.push(nodeJson);
        }
    }

    for(var key in argsMap){
        if (argsMap.hasOwnProperty(key)) {
            if(argsMap[key].parent_id){
                var userFrom = argsMap[key].user_id;
                var userTo  = argByUser[argsMap[key].parent_id];
                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]=0;
            }
        }
    }

    for(var key in argsMap){
        if (argsMap.hasOwnProperty(key)) {
            if(argsMap[key].parent_id){
                var userFrom = argsMap[key].user_id;
                var userTo  = argByUser[argsMap[key].parent_id];
                userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]++;
                if(userToUserCount[argsMap[key].user_id + argByUser[argsMap[key].parent_id]]>1)
                    delete argsMap[key];
            }
        }
    }

    for(var key in argsMap){
        if (argsMap.hasOwnProperty(key)) {
            if(argsMap[key].parent_id){
                var userFrom = argsMap[key].user_id;
                var userTo  = argByUser[argsMap[key].parent_id];
                var edge = {"from":userFrom,"to":userTo, arrows: { enabled: true, to: true }, "physics":true,
                            "label":userToUserCount[userFrom + userTo],"value":userToUserCount[userFrom + userTo]/3};
                edges.push(edge)
            }
        }
    }

    $scope.options = {
        autoResize: true,
        height: '800',
        width: '100%'
    };

    $scope.data = {
        "nodes": nodes,
        "edges": edges
    };

    $scope.data1 = {
        "nodes":[{"id":"000ECU","label":"000ECU","size":10,"color":"#93D276","shape":"circle","shadow":true},{"id":"caw182793_000ECU_not_installed_0","label":"caw182793","size":5,"color":"#7F8489","shape":"square","shadow":true},{"id":"pressman.example.com_000ECU_not_installed_1","label":"pressman.example.com","size":5,"color":"#7F8489","shape":"square","shadow":true},{"id":"000EGG","label":"000EGG","size":20,"color":"#93D276","shape":"circle","shadow":true,"borderWidth":5,"level":1,"shadow.size":20},{"id":"abhi-cloud-win2012-64_000EGG_in_active_0","label":"abhi-cloud-win2012-64","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"abhi-rh-64-cloud_000EGG_in_active_1","label":"abhi-rh-64-cloud","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"anand-win28r2_000EGG_in_active_2","label":"anand-win28r2","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ajay-pc_000EGG_in_active_3","label":"ajay-pc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"brk_000EGG_in_active_4","label":"brk","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"brk-win64_000EGG_in_active_5","label":"brk-win64","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"banu-wnd_000EGG_in_active_6","label":"banu-wnd","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"cas161850_000EGG_in_active_7","label":"cas161850","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw177084_000EGG_in_active_8","label":"caw177084","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw177749_000EGG_in_active_9","label":"caw177749","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw177936_000EGG_in_active_10","label":"caw177936","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw178075_000EGG_in_active_11","label":"caw178075","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw178237_000EGG_in_active_12","label":"caw178237","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw179183_000EGG_in_active_13","label":"caw179183","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw179333_000EGG_in_active_14","label":"caw179333","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw179452_000EGG_in_active_15","label":"caw179452","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw181412_000EGG_in_active_16","label":"caw181412","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw184412_000EGG_in_active_17","label":"caw184412","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw184911_000EGG_in_active_18","label":"caw184911","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"caw185133_000EGG_in_active_19","label":"caw185133","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"cc_000EGG_in_active_20","label":"cc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"config5645vm0_000EGG_in_active_21","label":"config5645vm0","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"config6034vm0_000EGG_in_active_22","label":"config6034vm0","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"config6056vm0_000EGG_in_active_23","label":"config6056vm0","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"config6320vm0_000EGG_in_active_24","label":"config6320vm0","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"config6367vm0_000EGG_in_active_25","label":"config6367vm0","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"d806037_000EGG_in_active_26","label":"d806037","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"gbw176857_000EGG_in_active_27","label":"gbw176857","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"hari-linux32_000EGG_in_active_28","label":"hari-linux32","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"hari_000EGG_in_active_29","label":"hari","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ia04-gzfwyw1_000EGG_in_active_30","label":"ia04-gzfwyw1","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ia04-rbwin7vm_000EGG_in_active_31","label":"ia04-rbwin7vm","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ics-64bit_000EGG_in_active_32","label":"ics-64bit","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ics-mang_000EGG_in_active_33","label":"ics-mang","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ics-mkto_000EGG_in_active_34","label":"ics-mkto","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ics-sensis_000EGG_in_active_35","label":"ics-sensis","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"in161659_000EGG_in_active_36","label":"in161659","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"in172040_000EGG_in_active_37","label":"in172040","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust0158_000EGG_in_active_38","label":"ust0158","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust0193_000EGG_in_active_39","label":"ust0193","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust0292_000EGG_in_active_40","label":"ust0292","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust0548_000EGG_in_active_41","label":"ust0548","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust0605_000EGG_in_active_42","label":"ust0605","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust0668_000EGG_in_active_43","label":"ust0668","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust1468_000EGG_in_active_44","label":"ust1468","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust1604_000EGG_in_active_45","label":"ust1604","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust1879_000EGG_in_active_46","label":"ust1879","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust1929_000EGG_in_active_47","label":"ust1929","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust1984_000EGG_in_active_48","label":"ust1984","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2191_000EGG_in_active_49","label":"ust2191","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2336_000EGG_in_active_50","label":"ust2336","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2340_000EGG_in_active_51","label":"ust2340","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2372_000EGG_in_active_52","label":"ust2372","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2465_000EGG_in_active_53","label":"ust2465","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2870_000EGG_in_active_54","label":"ust2870","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2949_000EGG_in_active_55","label":"ust2949","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2955_000EGG_in_active_56","label":"ust2955","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2966_000EGG_in_active_57","label":"ust2966","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust2969_000EGG_in_active_58","label":"ust2969","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust3562_000EGG_in_active_59","label":"ust3562","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust3924_000EGG_in_active_60","label":"ust3924","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust3929_000EGG_in_active_61","label":"ust3929","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4183_000EGG_in_active_62","label":"ust4183","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4306_000EGG_in_active_63","label":"ust4306","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4361_000EGG_in_active_64","label":"ust4361","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4513_000EGG_in_active_65","label":"ust4513","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4663_000EGG_in_active_66","label":"ust4663","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4691_000EGG_in_active_67","label":"ust4691","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4985_000EGG_in_active_68","label":"ust4985","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4992_000EGG_in_active_69","label":"ust4992","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust5001_000EGG_in_active_70","label":"ust5001","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust6005_000EGG_in_active_71","label":"ust6005","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust6023_000EGG_in_active_72","label":"ust6023","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust6043_000EGG_in_active_73","label":"ust6043","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust6531_000EGG_in_active_74","label":"ust6531","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust6532_000EGG_in_active_75","label":"ust6532","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust6581_000EGG_in_active_76","label":"ust6581","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust6828_000EGG_in_active_77","label":"ust6828","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"inx174071_000EGG_in_active_78","label":"inx174071","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"inx174442_000EGG_in_active_79","label":"inx174442","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"inx178680_000EGG_in_active_80","label":"inx178680","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"inx178784_000EGG_in_active_81","label":"inx178784","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"inx178792_000EGG_in_active_82","label":"inx178792","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"jasondesktop_000EGG_in_active_83","label":"jasondesktop","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"linux_64_000EGG_in_active_84","label":"linux_64","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"mang-ics_000EGG_in_active_85","label":"mang-ics","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"mangirish-ics_000EGG_in_active_86","label":"mangirish-ics","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"mangirishiscphg_000EGG_in_active_87","label":"mangirishiscphg","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"nj12app1018_000EGG_in_active_88","label":"nj12app1018","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"nylim-saradev_000EGG_in_active_89","label":"nylim-saradev","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"org - 0001mt unknown host_000EGG_in_active_90","label":"org - 0001mt unknown host","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"pl1usmgt0434nb_000EGG_in_active_91","label":"pl1usmgt0434nb","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"pmpc-anand_000EGG_in_active_92","label":"pmpc-anand","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"psvg28svprod_000EGG_in_active_93","label":"psvg28svprod","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"psvgwin28maui_000EGG_in_active_94","label":"psvgwin28maui","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"psvmabhipn_000EGG_in_active_95","label":"psvmabhipn","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"rnjkwak605_000EGG_in_active_96","label":"rnjkwak605","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"rrisqldb2_000EGG_in_active_97","label":"rrisqldb2","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sap_000EGG_in_active_98","label":"sap","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sd-linux_000EGG_in_active_99","label":"sd-linux","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sd-linux32agent_000EGG_in_active_100","label":"sd-linux32agent","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sql2k8r2_000EGG_in_active_101","label":"sql2k8r2","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"shweta_000EGG_in_active_102","label":"shweta","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"shweta-ics_000EGG_in_active_103","label":"shweta-ics","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sudeep-win-x86-64_000EGG_in_active_104","label":"sudeep-win-x86-64","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"suse_64_bit.example.com_000EGG_in_active_105","label":"suse_64_bit.example.com","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"us-r9m6cmn_000EGG_in_active_106","label":"us-r9m6cmn","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"usr8n68kd_000EGG_in_active_107","label":"usr8n68kd","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"vdsabhi_000EGG_in_active_108","label":"vdsabhi","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"w8v64od10_000EGG_in_active_109","label":"w8v64od10","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"win-3bdl7cshvhb_000EGG_in_active_110","label":"win-3bdl7cshvhb","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"win-6ib2ii78pf1_000EGG_in_active_111","label":"win-6ib2ii78pf1","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"win-kb53cqt94dc_000EGG_in_active_112","label":"win-kb53cqt94dc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"beetle_000EGG_in_active_113","label":"beetle","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"elantra_000EGG_in_active_114","label":"elantra","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"estilo_000EGG_in_active_115","label":"estilo","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"hari64bit_000EGG_in_active_116","label":"hari64bit","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"hickory.example.com_000EGG_in_active_117","label":"hickory.example.com","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"idea-pc_000EGG_in_active_118","label":"idea-pc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"in158066_000EGG_in_active_119","label":"in158066","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"in158111_000EGG_in_active_120","label":"in158111","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"in172041_000EGG_in_active_121","label":"in172041","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"india-pc_000EGG_in_active_122","label":"india-pc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"example-lap_000EGG_in_active_123","label":"example-lap","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"example-vendor.ubm-us.net_000EGG_in_active_124","label":"example-vendor.ubm-us.net","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"invgtestjr1_000EGG_in_active_125","label":"invgtestjr1","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ip-10-254-24-158_000EGG_in_active_126","label":"ip-10-254-24-158","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"kapil-pc_000EGG_in_active_127","label":"kapil-pc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"kizashi_000EGG_in_active_128","label":"kizashi","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"kraman-win7_000EGG_in_active_129","label":"kraman-win7","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"krishna-virtualbox_000EGG_in_active_130","label":"krishna-virtualbox","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"manish-pc_000EGG_in_active_131","label":"manish-pc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"mkhan-win7-32_000EGG_in_active_132","label":"mkhan-win7-32","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"mkhan-dt_000EGG_in_active_133","label":"mkhan-dt","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"mreddy_000EGG_in_active_134","label":"mreddy","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"psvgwn95ga1_000EGG_in_active_135","label":"psvgwn95ga1","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"rhel_000EGG_in_active_136","label":"rhel","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sameer-2kr2-cloud_000EGG_in_active_137","label":"sameer-2kr2-cloud","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sandeep-nanjappa_000EGG_in_active_138","label":"sandeep-nanjappa","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sudeep-ics-rh64_000EGG_in_active_139","label":"sudeep-ics-rh64","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sudeep-win28_000EGG_in_active_140","label":"sudeep-win28","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"sudeepubuntu64_000EGG_in_active_141","label":"sudeepubuntu64","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ubuntu_000EGG_in_active_142","label":"ubuntu","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"user-pc_000EGG_in_active_143","label":"user-pc","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"win2864sp2newtemplate_000EGG_in_active_144","label":"win2864sp2newtemplate","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"wk800020_000EGG_in_active_145","label":"wk800020","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"zest_000EGG_in_active_146","label":"zest","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"000EPU","label":"000EPU","size":10,"color":"#93D276","shape":"circle","shadow":true},{"id":"ust2191_000EPU_not_installed_0","label":"ust2191","size":5,"color":"#7F8489","shape":"square","shadow":true},{"id":"ust2957_000EPU_not_installed_1","label":"ust2957","size":5,"color":"#7F8489","shape":"square","shadow":true},{"id":"000ELU","label":"000ELU","size":10,"color":"#93D276","shape":"circle","shadow":true},{"id":"ust0490_000ELU_in_active_0","label":"ust0490","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4089_000ELU_in_active_1","label":"ust4089","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4205_000ELU_in_active_2","label":"ust4205","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust4492_000ELU_in_active_3","label":"ust4492","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"ust5202_000ELU_in_active_4","label":"ust5202","size":5,"color":"#FF2A00","shape":"square","shadow":true},{"id":"zan-win2008-64-sp2-dc-1_000ELU_in_active_5","label":"zan-win2008-64-sp2-dc-1","size":5,"color":"#FF2A00","shape":"square","shadow":true}],
        "edges":[{"from":"000EGG","to":"000ECU", arrows: { enabled: true, to: true }},{"from":"000ECU","to":"caw182793_000ECU_not_installed_0"},{"from":"000ECU","to":"pressman.example.com_000ECU_not_installed_1"},{"from":"000EGG","to":"abhi-cloud-win2012-64_000EGG_in_active_0"},{"from":"000EGG","to":"abhi-rh-64-cloud_000EGG_in_active_1"},{"from":"000EGG","to":"anand-win28r2_000EGG_in_active_2"},{"from":"000EGG","to":"ajay-pc_000EGG_in_active_3"},{"from":"000EGG","to":"brk_000EGG_in_active_4"},{"from":"000EGG","to":"brk-win64_000EGG_in_active_5"},{"from":"000EGG","to":"banu-wnd_000EGG_in_active_6"},{"from":"000EGG","to":"cas161850_000EGG_in_active_7"},{"from":"000EGG","to":"caw177084_000EGG_in_active_8"},{"from":"000EGG","to":"caw177749_000EGG_in_active_9"},{"from":"000EGG","to":"caw177936_000EGG_in_active_10"},{"from":"000EGG","to":"caw178075_000EGG_in_active_11"},{"from":"000EGG","to":"caw178237_000EGG_in_active_12"},{"from":"000EGG","to":"caw179183_000EGG_in_active_13"},{"from":"000EGG","to":"caw179333_000EGG_in_active_14"},{"from":"000EGG","to":"caw179452_000EGG_in_active_15"},{"from":"000EGG","to":"caw181412_000EGG_in_active_16"},{"from":"000EGG","to":"caw184412_000EGG_in_active_17"},{"from":"000EGG","to":"caw184911_000EGG_in_active_18"},{"from":"000EGG","to":"caw185133_000EGG_in_active_19"},{"from":"000EGG","to":"cc_000EGG_in_active_20"},{"from":"000EGG","to":"config5645vm0_000EGG_in_active_21"},{"from":"000EGG","to":"config6034vm0_000EGG_in_active_22"},{"from":"000EGG","to":"config6056vm0_000EGG_in_active_23"},{"from":"000EGG","to":"config6320vm0_000EGG_in_active_24"},{"from":"000EGG","to":"config6367vm0_000EGG_in_active_25"},{"from":"000EGG","to":"d806037_000EGG_in_active_26"},{"from":"000EGG","to":"gbw176857_000EGG_in_active_27"},{"from":"000EGG","to":"hari-linux32_000EGG_in_active_28"},{"from":"000EGG","to":"hari_000EGG_in_active_29"},{"from":"000EGG","to":"ia04-gzfwyw1_000EGG_in_active_30"},{"from":"000EGG","to":"ia04-rbwin7vm_000EGG_in_active_31"},{"from":"000EGG","to":"ics-64bit_000EGG_in_active_32"},{"from":"000EGG","to":"ics-mang_000EGG_in_active_33"},{"from":"000EGG","to":"ics-mkto_000EGG_in_active_34"},{"from":"000EGG","to":"ics-sensis_000EGG_in_active_35"},{"from":"000EGG","to":"in161659_000EGG_in_active_36"},{"from":"000EGG","to":"in172040_000EGG_in_active_37"},{"from":"000EGG","to":"ust0158_000EGG_in_active_38"},{"from":"000EGG","to":"ust0193_000EGG_in_active_39"},{"from":"000EGG","to":"ust0292_000EGG_in_active_40"},{"from":"000EGG","to":"ust0548_000EGG_in_active_41"},{"from":"000EGG","to":"ust0605_000EGG_in_active_42"},{"from":"000EGG","to":"ust0668_000EGG_in_active_43"},{"from":"000EGG","to":"ust1468_000EGG_in_active_44"},{"from":"000EGG","to":"ust1604_000EGG_in_active_45"},{"from":"000EGG","to":"ust1879_000EGG_in_active_46"},{"from":"000EGG","to":"ust1929_000EGG_in_active_47"},{"from":"000EGG","to":"ust1984_000EGG_in_active_48"},{"from":"000EGG","to":"ust2191_000EGG_in_active_49"},{"from":"000EGG","to":"ust2336_000EGG_in_active_50"},{"from":"000EGG","to":"ust2340_000EGG_in_active_51"},{"from":"000EGG","to":"ust2372_000EGG_in_active_52"},{"from":"000EGG","to":"ust2465_000EGG_in_active_53"},{"from":"000EGG","to":"ust2870_000EGG_in_active_54"},{"from":"000EGG","to":"ust2949_000EGG_in_active_55"},{"from":"000EGG","to":"ust2955_000EGG_in_active_56"},{"from":"000EGG","to":"ust2966_000EGG_in_active_57"},{"from":"000EGG","to":"ust2969_000EGG_in_active_58"},{"from":"000EGG","to":"ust3562_000EGG_in_active_59"},{"from":"000EGG","to":"ust3924_000EGG_in_active_60"},{"from":"000EGG","to":"ust3929_000EGG_in_active_61"},{"from":"000EGG","to":"ust4183_000EGG_in_active_62"},{"from":"000EGG","to":"ust4306_000EGG_in_active_63"},{"from":"000EGG","to":"ust4361_000EGG_in_active_64"},{"from":"000EGG","to":"ust4513_000EGG_in_active_65"},{"from":"000EGG","to":"ust4663_000EGG_in_active_66"},{"from":"000EGG","to":"ust4691_000EGG_in_active_67"},{"from":"000EGG","to":"ust4985_000EGG_in_active_68"},{"from":"000EGG","to":"ust4992_000EGG_in_active_69"},{"from":"000EGG","to":"ust5001_000EGG_in_active_70"},{"from":"000EGG","to":"ust6005_000EGG_in_active_71"},{"from":"000EGG","to":"ust6023_000EGG_in_active_72"},{"from":"000EGG","to":"ust6043_000EGG_in_active_73"},{"from":"000EGG","to":"ust6531_000EGG_in_active_74"},{"from":"000EGG","to":"ust6532_000EGG_in_active_75"},{"from":"000EGG","to":"ust6581_000EGG_in_active_76"},{"from":"000EGG","to":"ust6828_000EGG_in_active_77"},{"from":"000EGG","to":"inx174071_000EGG_in_active_78"},{"from":"000EGG","to":"inx174442_000EGG_in_active_79"},{"from":"000EGG","to":"inx178680_000EGG_in_active_80"},{"from":"000EGG","to":"inx178784_000EGG_in_active_81"},{"from":"000EGG","to":"inx178792_000EGG_in_active_82"},{"from":"000EGG","to":"jasondesktop_000EGG_in_active_83"},{"from":"000EGG","to":"linux_64_000EGG_in_active_84"},{"from":"000EGG","to":"mang-ics_000EGG_in_active_85"},{"from":"000EGG","to":"mangirish-ics_000EGG_in_active_86"},{"from":"000EGG","to":"mangirishiscphg_000EGG_in_active_87"},{"from":"000EGG","to":"nj12app1018_000EGG_in_active_88"},{"from":"000EGG","to":"nylim-saradev_000EGG_in_active_89"},{"from":"000EGG","to":"org - 0001mt unknown host_000EGG_in_active_90"},{"from":"000EGG","to":"pl1usmgt0434nb_000EGG_in_active_91"},{"from":"000EGG","to":"pmpc-anand_000EGG_in_active_92"},{"from":"000EGG","to":"psvg28svprod_000EGG_in_active_93"},{"from":"000EGG","to":"psvgwin28maui_000EGG_in_active_94"},{"from":"000EGG","to":"psvmabhipn_000EGG_in_active_95"},{"from":"000EGG","to":"rnjkwak605_000EGG_in_active_96"},{"from":"000EGG","to":"rrisqldb2_000EGG_in_active_97"},{"from":"000EGG","to":"sap_000EGG_in_active_98"},{"from":"000EGG","to":"sd-linux_000EGG_in_active_99"},{"from":"000EGG","to":"sd-linux32agent_000EGG_in_active_100"},{"from":"000EGG","to":"sql2k8r2_000EGG_in_active_101"},{"from":"000EGG","to":"shweta_000EGG_in_active_102"},{"from":"000EGG","to":"shweta-ics_000EGG_in_active_103"},{"from":"000EGG","to":"sudeep-win-x86-64_000EGG_in_active_104"},{"from":"000EGG","to":"suse_64_bit.example.com_000EGG_in_active_105"},{"from":"000EGG","to":"us-r9m6cmn_000EGG_in_active_106"},{"from":"000EGG","to":"usr8n68kd_000EGG_in_active_107"},{"from":"000EGG","to":"vdsabhi_000EGG_in_active_108"},{"from":"000EGG","to":"w8v64od10_000EGG_in_active_109"},{"from":"000EGG","to":"win-3bdl7cshvhb_000EGG_in_active_110"},{"from":"000EGG","to":"win-6ib2ii78pf1_000EGG_in_active_111"},{"from":"000EGG","to":"win-kb53cqt94dc_000EGG_in_active_112"},{"from":"000EGG","to":"beetle_000EGG_in_active_113"},{"from":"000EGG","to":"elantra_000EGG_in_active_114"},{"from":"000EGG","to":"estilo_000EGG_in_active_115"},{"from":"000EGG","to":"hari64bit_000EGG_in_active_116"},{"from":"000EGG","to":"hickory.example.com_000EGG_in_active_117"},{"from":"000EGG","to":"idea-pc_000EGG_in_active_118"},{"from":"000EGG","to":"in158066_000EGG_in_active_119"},{"from":"000EGG","to":"in158111_000EGG_in_active_120"},{"from":"000EGG","to":"in172041_000EGG_in_active_121"},{"from":"000EGG","to":"india-pc_000EGG_in_active_122"},{"from":"000EGG","to":"example-lap_000EGG_in_active_123"},{"from":"000EGG","to":"example-vendor.ubm-us.net_000EGG_in_active_124"},{"from":"000EGG","to":"invgtestjr1_000EGG_in_active_125"},{"from":"000EGG","to":"ip-10-254-24-158_000EGG_in_active_126"},{"from":"000EGG","to":"kapil-pc_000EGG_in_active_127"},{"from":"000EGG","to":"kizashi_000EGG_in_active_128"},{"from":"000EGG","to":"kraman-win7_000EGG_in_active_129"},{"from":"000EGG","to":"krishna-virtualbox_000EGG_in_active_130"},{"from":"000EGG","to":"manish-pc_000EGG_in_active_131"},{"from":"000EGG","to":"mkhan-win7-32_000EGG_in_active_132"},{"from":"000EGG","to":"mkhan-dt_000EGG_in_active_133"},{"from":"000EGG","to":"mreddy_000EGG_in_active_134"},{"from":"000EGG","to":"psvgwn95ga1_000EGG_in_active_135"},{"from":"000EGG","to":"rhel_000EGG_in_active_136"},{"from":"000EGG","to":"sameer-2kr2-cloud_000EGG_in_active_137"},{"from":"000EGG","to":"sandeep-nanjappa_000EGG_in_active_138"},{"from":"000EGG","to":"sudeep-ics-rh64_000EGG_in_active_139"},{"from":"000EGG","to":"sudeep-win28_000EGG_in_active_140"},{"from":"000EGG","to":"sudeepubuntu64_000EGG_in_active_141"},{"from":"000EGG","to":"ubuntu_000EGG_in_active_142"},{"from":"000EGG","to":"user-pc_000EGG_in_active_143"},{"from":"000EGG","to":"win2864sp2newtemplate_000EGG_in_active_144"},{"from":"000EGG","to":"wk800020_000EGG_in_active_145"},{"from":"000EGG","to":"zest_000EGG_in_active_146"},{"from":"000EGG","to":"000EPU"},{"from":"000EPU","to":"ust2191_000EPU_not_installed_0"},{"from":"000EPU","to":"ust2957_000EPU_not_installed_1"},{"from":"000EGG","to":"000ELU"},{"from":"000ELU","to":"ust0490_000ELU_in_active_0"},{"from":"000ELU","to":"ust4089_000ELU_in_active_1"},{"from":"000ELU","to":"ust4205_000ELU_in_active_2"},{"from":"000ELU","to":"ust4492_000ELU_in_active_3"},{"from":"000ELU","to":"ust5202_000ELU_in_active_4"},{"from":"000ELU","to":"zan-win2008-64-sp2-dc-1_000ELU_in_active_5"}]};

    $scope.ok = function () {
        $uibModalInstance.close();
    };
});