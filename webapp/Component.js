sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"org/fater/scadenzario/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("org.fater.scadenzario.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set the JSON model
			this.setModel(models.createJSONModel());

			// set the Temp model
			this.setModel(models.createTempModel(), "tempModel");
			
			var sRootPath = jQuery.sap.getModulePath("org.fater.scadenzario");
			
			jQuery("head").append("<script src='" + sRootPath + "/assets/js/underscore.js'/>");
		}
	});

});