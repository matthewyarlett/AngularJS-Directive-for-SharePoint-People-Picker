(function () {
    angular.module('ui.People', [])
    .value('uiPeopleConfig', {})
    .directive('uiPeople', ['uiPeopleConfig', '$q', '$resource', '$timeout', function (uiPeopleConfig, $q, $resource, $timeout) {
        uiPeopleConfig = uiPeopleConfig || {};
        var generatedIds = 0;
        return {
            require: ['ngModel'],
            priority: 10,
            link: function (scope, elm, attrs, ngModel) {
               var userModel = null;
               var peoplePickerInstance = elm[0];
               var securityValidation = ''; 
               var loading = true;
               var dataLoaded = false;
               var scriptsLoaded = false;
               var currentWebUrl = '';
               var clientCtx = null;
               var isMultiValued = (attrs.ppIsMultiuser == true || attrs.ppIsMultiuser == 'true') ? true : false;	
               var principalAccountType = (attrs.ppAccountType && attrs.ppAccountType.match(/^(?:user)|(?:dl)|(?:secgroup)|(?:spgroup)$/i)) ? attrs.ppAccountType : 'User,DL,SecGroup,SPGroup';
               var pickerWidth = (attrs.ppWidth && attrs.ppWidth.match(/^[0-9][0-9]*px$/i)) ? attrs.ppWidth : '220px';
               var updateView = function () {
                       ngModel[0].$setViewValue(userModel);
                       if (!scope.$root.$$phase) {
                           scope.$apply();
                       }
                   };	
               var getViewValue = function(){
                  return ngModel[0].$modelValue;
               }				
               var models = {};				
               models.userPickerSchema = function (accountType, multipleValues, width) {
                  this.userPickerSchema = {};
                  this.PrincipalAccountType = accountType ? accountType : 'User,DL,SecGroup,SPGroup';
                  this.SearchPrincipalSource = 15;
                  this.ResolvePrincipalSource = 15;
                  this.AllowMultipleValues = multipleValues == true ? true : false;
                  this.MaximumEntitySuggestions = 50;
                  this.Width = width ? width : '220px';
                  this.OnUserResolvedClientScript = null;
               }				
               models.userPickerUserSchema = function () {
                  this.userPickerUserSchema = {};
                  this.AutoFillDisplayText = null;
                  this.AutoFillKey = null;
                  this.AutoFillSubDisplayText = "";
                  this.DisplayText = null;
                  this.EntityType = "User";
                  this.IsResolved = true;
                  this.Key = null;
                  this.ProviderDisplayName = "Tenant";
                  this.ProviderName = "Tenant";
                  this.Resolved = true;
               }
               models.ensureUser = function () {
                  this.logonName = null;
               }
               
               function init() {										
                  waitForScriptsToLoad().then(function (data) {
                     refreshSecurityValidation();
                     scriptsLoaded = true;
                     if(dataLoaded){
                        initializePeoplePicker();
                     }
                  })["catch"](function (error) {
                     //log error
                  });					
               };					
               
               scope.$watch(function(){return attrs.ppReadyToLoad}, function(value) {
                 if(value == true || value == 'true'){
                  dataLoaded = true;
                  if(scriptsLoaded){
                     initializePeoplePicker();
                  }
                 }
               });

               function initializePeoplePicker() {					
                  userModel = getViewValue();
                  if(!userModel){
                     userModel = [];						
                     updateView();
                  }
                  var schema = new models.userPickerSchema(principalAccountType, isMultiValued, pickerWidth);
                  schema.OnUserResolvedClientScript = function (elementId, userKey) {
                     var s = 'something';
                     setUserIdFromPickerChoice(userKey);
                  }
                  var users = [];
                  var userCollection = userModel;
                  if (userCollection) {
                     for (var i = 0; i < userCollection.length; i++) {
                        var cu = userCollection[i];
                        var user = getPeoplePickerUserObject(cu.Name, cu.Title);
                        if (user) {
                           users.push(user);
                        }
                     }
                  }
                  SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerInstance.id, users, schema);
                  loading = false;
               }
      
               function setUserIdFromPickerChoice(userKeys) {
                  //If the directive is loading users during initialisation, we don't need to call Ensure user or update the model (the users are coming from the model during init).  
                  if(loading){return};
                  //Get the current model value
                  userModel = ngModel[0].$modelValue;										
                  var updatedUserModel = [];
                  var pendingUsers = [];
                  //1. Remove all the entries out of the current array that aren't in the new array
                  //2. For all the entries that are in the new array, but not in the old array, call ensure user.
                  for(var i = 0; i < userKeys.length; i++){
                     var currentEntity = userKeys[i];
                     var currentEntityFoundInExistingModel = false;
                     for(var b = 0; b < userModel.length; b++){
                        var existingEntity = userModel[b];
                        if(existingEntity.Name == currentEntity.Key){								
                           //Found a matching user in the existing model.
                           updatedUserModel.push({'Name':existingEntity.Name, 'Title':existingEntity.Title, 'Id':existingEntity.Id});
                           currentEntityFoundInExistingModel = true;
                           break;
                        }
                     }
                     if(!currentEntityFoundInExistingModel){
                        //the current picker entity was not found in the existing array. Add it to the pendingusers array
                        //we'll call EnsureUser on all the users in this array, before added them to the model
                        pendingUsers.push(currentEntity.Key);
                     }
                  }
                  //clean up the old array and replace it with the new array
                  delete userModel;
                  userModel = updatedUserModel;
                  
                  //Now all we need to do, is call EnsureUser on any pending users, get the users SPUser.Id, and add the user to the userModel array. 
                  if (pendingUsers.length > 0) {
                     for (var i = 0; i < pendingUsers.length; i++) {
                        //Call ensure user, and then get the user ID
                        getUser(pendingUsers[i])
                        .then(function (data) {
                           if (data.Id && data.LoginName) {
                              userModel.push({ 'Name': data.LoginName, 'Title': data.Title, 'Id': data.Id });
                           }					    
                        })
                        ["catch"](function (error) {						    
                           //log error
                        });
                     }						
                  }
                  //Finally, update the view with the model changes.
                  updateView();					
               }
         
               function getPeoplePickerUserObject(userName, displayName){
                  if (userName && displayName) {
                     var user = new models.userPickerUserSchema();
                     user.AutoFillDisplayText = displayName;
                     user.AutoFillKey = userName;
                     user.DisplayText = displayName;
                     user.Key = userName;
                     return user;
                  }
                  return null;
               }
               
               function refreshSecurityValidation() {
                  var siteCtxInfoResource = $resource(currentWebUrl + '/_api/contextinfo', {}, {
                     post: {
                        method: 'POST',
                        headers: {
                           'Accept': 'application/json;odata=verbose',
                           'Content-Type': 'application/json;odata=verbose'
                        }
                     }
                  });

                  siteCtxInfoResource.post({},
                     function (data) {
                        //callback success. Get digest timeout and value, and store it in the service
                        var siteCtxInfo = data.d.GetContextWebInformation;
                        var validationRefreshTimeout = siteCtxInfo.FormDigestTimeoutSeconds - 10;
                        securityValidation = siteCtxInfo.FormDigestValue;
                        //repeat the validation refresh in timeout
                        $timeout(function () {
                           refreshSecurityValidation();
                        }, validationRefreshTimeout * 1000);
                     },
                     function (error) {
                     });
               }
               
               function getUserIdResource() {
                  return $resource(currentWebUrl + '/_api/web/ensureuser',
                     {}, {
                        post: {
                           method: 'POST',
                           params: {
                           },
                           headers: {
                              'Accept': 'application/json;odata=verbose',
                              'Content-Type': 'application/json;odata=verbose;',
                              'X-RequestDigest': securityValidation
                           }
                        }
                     });
               }

               function getUser(claimsUserName) {
                  var spUserModel = new models.ensureUser();
                  spUserModel.logonName = claimsUserName;
                  var resource = getUserIdResource();
                  var deferred = $q.defer();

                  resource.post(spUserModel, function (data) {
                     //successful callback                
                     deferred.resolve(data.d);
                  }, function (error) {
                     //error callback
                     var message = 'data service error: ' + error.statusText;                
                     deferred.reject(message);
                  });

                  return deferred.promise;
               }    
               
               function waitForScriptsToLoad() {
                  var deferred = $q.defer();
                  if (SP.ClientContext === undefined) {
                     SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {							
                        clientCtx = SP.ClientContext.get_current();
                        currentWebUrl = clientCtx.get_url();
                        deferred.resolve(true);
                     });
                  } else {
                     clientCtx = SP.ClientContext.get_current();
                     currentWebUrl = clientCtx.get_url();
                     deferred.resolve(true);
                  }
                  return deferred.promise;
               }
               
               // generate an ID if not present
               if (!attrs.id) {
                 attrs.$set('id', 'uiPeople' + generatedIds++);
               }

               ngModel.$render = function () {                    
                  if (peoplePickerInstance) {                        
                     init();
                     ngModel.$setPristine();
                  }
               };
               
               init();
            }
        };
    }]);
})();
