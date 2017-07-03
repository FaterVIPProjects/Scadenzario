sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			
			return oModel;
			
		},
		
		_getBundle:  function(){
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
				sRootPah = jQuery.sap.getModulePath("org.fater.scadenzario");
				
			return jQuery.sap.resources({
				url : sRootPah + "/i18n/i18n.properties", 
				locale: sLanguage
			});
		},
		
		createJSONModel: function () {
			
			var oBundle = this._getBundle();
			
			var oModel = new sap.ui.model.json.JSONModel({
				
				suppliers:			[],
				clusterManagers:	[],
				supplierStatuses:	[
					{
						"name": oBundle.getText("supplierStatusesAllLabel"),
						"key":	"all" 
					},
					{
						"name": oBundle.getText("supplierStatusesBidderLabel"),
						"key":	"bidder" 
					},
					{
						"name": oBundle.getText("supplierStatusesCodedLabel"),
						"key":	"coded" 
					}	
				],
				
				filters: {
					suppliers:			[],
					clusterManagers:	[],
					expireDate: 		null,
					expireStartDate: 	null,
					expireEndDate: 		null,
					expireStart: 		"",
					expireEnd: 			"",
					supplierStatus:		"all",
					expireCheck:		true
				},
				
				defaultFilters: {
					suppliers:			[],
					clusterManagers:	[],
					expireDate: 		null,
					expireStartDate: 	null,
					expireEndDate: 		null,
					expireStart: 		"",
					expireEnd: 			"",
					supplierStatus:		"all"
				},
				
				documents: []
				
			});

			oModel.setSizeLimit(99999999);			
			return oModel;
			
		},
		
		createTempModel: function () {
			
			var oBundle = this._getBundle();
			
			var oModel  = new sap.ui.model.json.JSONModel({
				
				dataLoaded: false,
				
				sortItems: [
					{
						text: oBundle.getText("docExpireLabel"),
						key: "RemainingDays",
						selected: true
					},
					{
						text: oBundle.getText("docSupplierIdLabel"),
						key: "SupplierId",
						selected: false
					},
					{
						text: oBundle.getText("docSupplierNameLabel"),
						key: "Name1",
						selected: false
					}
				],
				
				groupItems: [
					{
						text: oBundle.getText("docStatusLabel"),
						key: "Status",
						selected: true
					},
					{
						text: oBundle.getText("docMandatoryLabel"),
						key: "MandatoryDoc",
						selected: false
					},
					{
						text: oBundle.getText("docSupplierStatusLabel"),
						key: "SupplierStatus",
						selected: false
					},
					{
						text: oBundle.getText("docSupplierIdLabel"),
						key: "SupplierId",
						selected: false
					},
					{
						text: oBundle.getText("docSupplierNameLabel"),
						key: "Name1",
						selected: false
					},
					{
						text: oBundle.getText("docClusterLable"),
						key: "ClusterId",
						selected: false
					}
				],
				
				tableColumns: [
				
					{
						name: oBundle.getText("docStatusLabel"),
						selected: true
					},
					{
						name: oBundle.getText("docDescriptionLabel"),
						selected: true
					},
					{
						name: oBundle.getText("docAmountLabel"),
						selected: true
					},
					{
						name: oBundle.getText("docMandatoryLabel"),
						selected: true
					}	,
					{
						name: oBundle.getText("docSupplierStatusLabel"),
						selected: true
					},
					{
						name: oBundle.getText("docSupplierIdLabel"),
						selected: true
					},
					{
						name: oBundle.getText("docSupplierNameLabel"),
						selected: true
					},
					{
						name: oBundle.getText("docClusterLable"),
						selected: true
					}	
					
				]
			});
			
			return oModel;
		}		

	};

});