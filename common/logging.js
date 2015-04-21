(function () {
    'use strict';

    //define the service as a factory
    angular.module('common').factory('logger', ['$log', 'config', '$injector', logger]);

    //create the factory
    function logger($log, config, $injector) {
        var rootScope = null;
        return {
            log: log,
            logError: logError,
            logSuccess: logSuccess,
            logWarning: logWarning
        };

        function log(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "info");
        }

        function logError(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "error");
        }

        function logSuccess(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "success");
        }

        function logWarning(message, data, source, showNotification) {
            writeLog(message, data, source, showNotification, "warning");
        }

        function writeLog(message, data, source, showNotification, notificationType) {
            var iconUrl, notiTitle;
            iconUrl = "";
            notiTitle = "EBCS: UNDEFINED";
            //default the showNotification to true if not specified
            if (showNotification === undefined) {
                showNotification = true;
            }

            //Write to the AngularJS log & specify if it's an error or not.
            var write = (notificationType === 'error') ? $log.error : $log.log;
            source = source ? '[' + source + '] ' : '';
            message = message + ' ';
            write(source, message, data);
        }       

    }


})();