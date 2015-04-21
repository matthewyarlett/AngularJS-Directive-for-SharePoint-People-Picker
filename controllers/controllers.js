
//App Controller
(function () {
    'use strict';
    var controllerId = 'appCtrlr';
    angular.module('app').controller(controllerId, ['$scope', appCtrlr]);

    function appCtrlr($scope) {
      var vm = this;	      
      vm.data = {};
		vm.data.su  = [];
		vm.data.mu = [];		
		vm.getPresence = getPresence;
      var peoplePickerInitalised = false;
      
      function populatePickerModel(object){
         var userInfoItems = [];
         if(object){
            if(object instanceof Array){
               for(var i = 0; i < object.length; i++){
                  var data = object[i];
                  userInfoItems.push({ 'Name': data.Name, 'Title': data.Title, 'Id': data.Id })
               }
            }
            else{
               userInfoItems.push({ 'Name': object.Name, 'Title': object.Title, 'Id': object.Id })
            }
         }
         return userInfoItems;
      }
         
      init();

      function init() {			
         //Pre-populate the single user field
         //Normally you would get this information from a REST call to Office 365 / SharePoint
         vm.data.su = populatePickerModel({
            //You'll need to add a valid claims based identity, and the SPUSER ID here
            Name:'i:0#.f|membership|someone@sometenant.onmicrosoft.com',
            Id:'19', 
            Title:'Matthew Yarlett'});
         vm.loadPeoplePickers = true;
         if (!$scope.$root.$$phase) {
            $scope.$apply();
         }
      };
               
      function getPresence(userId, userTitle) {
         if (userId && userTitle) {
            return '<span class="ms-noWrap"><span class="ms-spimn-presenceLink"><span class="ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10"><img class="ms-spimn-img ms-spimn-presence-disconnected-10x10x32" src="'+constWeb+'/_layouts/15/images/spimn.png?rev=23"  alt="" /></span></span><span class="ms-noWrap ms-imnSpan"><span class="ms-spimn-presenceLink"><img class="ms-hide" src="'+constWeb+'/_layouts/15/images/blank.gif?rev=23"  alt="" /></span><a class="ms-subtleLink" onclick="GoToLinkOrDialogNewWindow(this);return false;" href="'+constWeb+'/_layouts/15/userdisp.aspx?ID=' + userId + '">' + userTitle + '</a></span></span>';
         }
            return '<span></span>';
      }
   }

})();
