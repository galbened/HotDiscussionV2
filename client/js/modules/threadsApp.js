(function() {
  'use strict';
  angular
    .module('threadsApp', [], function($locationProvider){
      $locationProvider.html5Mode(true);
    })
    .controller('threadCtrl', ['$scope','$http', '$location', function($scope, $http, $location){

      var path = $location.path();
      var id = path.split('/')[1];
      // $scope.threads = [];
      $scope.threads = [
        {
          id: 1,
          disc_id: id,
          title: "לדעתי האינתיפאדה השלישית לא פרצה בכלל ברוב העם הפלסטיני לא מוכן לספוג אבידות והוא רוצה למצוא דרכים חלופיות להלחם על הזכויות שלו",
          content: "למרות המאמצים של ארגוני הטרור השונים, רוב העם הפלסטיני לא רוצה בהסלמה, מפני שאחרת היינו רואים הרבה יותר הפגנות!!",
          username: 'srominm',
          ptime: '14/05/16, 01:00:47',
          level: 0,
          comments: [3]
        },
        {
          id: 2,
          disc_id: id,
          title: "לדעתי האינתיפאדה השנייה התחילה כבר הדקירה השלישית בירושלים, כשברור שהעם הפלסטיני מעוניין בהסלמה וממשיך בהסתה יומיומית כדי להגדיל את מרחץ הדמים!",
          content: "אין בכלל ספק שהעם הפלסטיני החליט פה אחד שהאינפאדה השנייה יוצאת לדרך, והם לוקחים בחשבון את כל ההשלכות בדבר. הם עוזרים למחבלים, לא מגנים פיגועים...",
          username: 'yossi',
          ptime: '14/05/16, 01:07:51',
          level: 0,
          comments: []
        },
        {
          id: 3,
          disc_id: id,
          title: "אתה צודק במאה אחוזים! הערבים כבר תכננו ממזמן את אופי הפיכועים, הם לא מעוניינים בפיגועי ראווה כי זה יוביל למשהו יותר מדי קיצוני. ",
          content: "הערבים מעוניינים להתחיל בצורה ביניונית, ואז לאט לאט, כשהם בישראל כבר רגיל לשגרה יומיומית מטורפת, להסלים לאט לאט את הפגיועים נגדו",
          username: 'dani',
          ptime: '14/05/16, 01:09:46',
          level: 1,
          comments: []
        }
      ];





      // $scope.debug = 5;
      

      //show all the threads from level 0 in the discussion
      // $http({
      //   method: 'GET',
      //   url: '/api/discussions/'
      // }).then(function(res){
      //   $scope.discussions = res.data;
      // }, function(err){
      //   console.log(err.statusText);
      // });  

      // $scope.goToDisc = function(idx){
      // 	var title = $scope.discussions[idx].title;
      // 	var description = $scope.discussions[idx].description;

      // 	$window.location.href = '/discussions/' + title + '/' +description;
      // };
    }]);
})();
