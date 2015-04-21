(function () {
    'use strict';        
    var app = angular.module('app', [
    //inject other Angular Modules	
	'ngSanitize',
   'ngResource',	
   'ui.bootstrap',
	//inject the People Picker directive
   'ui.People',
    //inject App modules
    'common'
    ]);
})();