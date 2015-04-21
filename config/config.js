(function () {
    'use strict';
    var app = angular.module('app');

    //monitord events
    var events = {                
		//eg:
		//updateModalMessage: 'updateModalMessage'
    };

    //app config 
    var config = {
        //exception handler declaration
        appErrorPrefix: '[SHIP_TRACKER_ERR]',
        //app events
        events: events,
        //app version
        version: '1.0.0.0'
    };

    //add a the global variable 'config' to the app
    app.value('config', config);

    //configure the AngularJS logging service
    app.config([
        '$logProvider', function ($logProvider) {
            //turn logging on/off
            if ($logProvider.debugEnabled) {
                $logProvider.debugEnabled(true);
            }
        }
    ]);

    //commonConfigProvider
    app.config(['commonConfigProvider', function (cfg) {
        //eg.
		//cfg.config.updateModalMessage = config.events.updateModalMessage;		
    }
    ]);


})();
