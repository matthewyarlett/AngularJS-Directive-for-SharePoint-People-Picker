var sr = sr || {};
sr.models = sr.models || {};

sr.models.ensureUser = function () {
    this.logonName = null;
}

var sr = sr || {};
sr.models = sr.models || {};

sr.models.listItemModel = function (id) {
   this.Id = id ? id : -1;	
   this.srSingleUserField = null;
   this.srMultipleUserField = {
      results: []
   };   
   this.__metadata = {
      //The type is unique to your list. You can find out the type byte
      //looking at the list using a REST via the browser
      //E.g. http://my.site.com/_api/web/lists/getlistbytitle("YourListName")
      type: 'SP.Data.SrListItem'
   };
}

function populatelistItemModel(srcModel, tagsTerms) {
   var dstModel = new sr.models.listItemModel(srcModel.Id);            
	//Single user field
	if(srcModel.su){
		if(srcModel.su.length == 0){
			dstModel.srSingleUserField = null;
		}
		else{
			var user = srcModel.su[0];
			dstModel.srSingleUserField = user.Id
		}
	} 
   //Mutli user field
   if (srcModel.mu) {
      if(srcModel.mu.length == 0){
         dstModel.srMultipleUserField.results = [];
      }
      else{
         for(var i = 0; i < srcModel.mu.length; i++){
            var user = srcModel.mu[i];
            dstModel.srMultipleUserField.results.push(user.Id);
         }
      }
   }
   dstModel.__metadata.etag = srcModel.__metadata.etag;
   dstModel.__metadata.id = srcModel.__metadata.id;
   dstModel.__metadata.uri = srcModel.__metadata.uri;
   return dstModel;
}
