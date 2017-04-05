/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
jQuery.sap.declare("org.fater.app.util.Formatter");

org.fater.app.util.Formatter = {
	
	documentStatus: function (iStatus){
		
		switch (iStatus){
			
			case "1":
				return "#00FF00";
			
			case "2":
				return "#FFA200";
			
			case "3":
				return "#FF0000";
			
			default:
				return "#0000FF";
				
		}
	},
	
	supplierStatus: function (sSupplierStatus) {
		
		var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		var sRootPath = jQuery.sap.getModulePath("org.fater.app");
		
		if (!this._bundle){
			this._bundle = jQuery.sap.resources({
				url : sRootPath + "/i18n/i18n.properties", 
				locale: sLanguage
			});
		}
		
		switch (sSupplierStatus){
			
			case "BIDDER":
				return this._bundle.getText("supplierStatusesBidderLabel");
				
			default:
				return this._bundle.getText("supplierStatusesCodedLabel");
		}
	},
	
	mandatoryDoc: function (sMandatoryDoc) {
		if (!sMandatoryDoc) return false;
		return (sMandatoryDoc.trim().toUpperCase() === 'X');
	}
	
};