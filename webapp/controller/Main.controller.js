/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

jQuery.sap.require("org.fater.app.util.Formatter");

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	'sap/ui/model/Filter',
	"sap/ui/model/Sorter",
	"sap/m/MessageBox"
], function(Controller, MessageBox, Filter, Sorter, MessageToast) {
	"use strict";

	return Controller.extend("org.fater.app.controller.Main", {

		onInit : function(){
			this._arrayFilterWidth = ["22%", "22%", "10%", "22%", "12%", "12%", "10%"];
			var filterBar = this.getView().byId("supplierFilterBar");
			var content = filterBar.getContent()[1];
			for (var i = 0; content.getContent()[i]; i++){
				content.getContent()[i].setProperty("width", this._arrayFilterWidth[i]);
			}
		},
		
		handleFilterDialogClosed: function(oEvent){
			var filterBar = this.getView().byId("supplierFilterBar");
			var content = filterBar.getContent()[1];
			var indexContent = 0;
			for (var i = 0; filterBar.getAllFilterItems()[i] && content.getContent()[indexContent]; i++){
				if (filterBar.getAllFilterItems()[i].getVisibleInFilterBar()){
					content.getContent()[indexContent].setProperty("width", this._arrayFilterWidth[i + 1]);
					indexContent++;
				}
			}
		},
		
		_handleSuggest: function(oEvent){
			var sTerm = oEvent.getParameter("suggestValue"); 
			var aFilters = []; 
			if (sTerm.length >= 3) { 
				aFilters.push(new Filter("Name1", sap.ui.model.FilterOperator.Contains, sTerm)); 					
				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			} else {
				return null;
			}			
		},
		
		handleSuggestionSelected: function(oEvent){
			
			// Retrieve selected items
			var aSelectedItem = oEvent.getParameter("selectedItem");
			var oModel = this.getView().getModel();
			
			if (aSelectedItem) {
				var suppliersToken = oModel.getProperty("/filters/suppliers");
				// Remove possible valueState Error
				var oSupplierInput = this.getView().byId("supplierFilterInput");
				oSupplierInput.setValueState(sap.ui.core.ValueState.None);			
				
				for (var i = 0; suppliersToken[i]; i++){
					if (suppliersToken[i].supplierId === aSelectedItem.getKey()){
						var oBundle = this.getResourceBundle();
						MessageBox.error(
							oBundle.getText("alreadySelectedSupplier")
						);	
						//Su Fiori questa parte di codice non è necessaria
/*						var supplierFilterInput = this.getView().byId("supplierFilterInput");
						var tokens = supplierFilterInput.getTokens();
						supplierFilterInput.removeToken(tokens[tokens.length - 1].getId());*/
						return;
					}
				}				
					
				var oSelectedSupplier = {
					"Name1" : aSelectedItem.getText(),
					"SupplierId" : aSelectedItem.getKey()
				};
				oModel.getProperty("/filters/suppliers").push(oSelectedSupplier);
			}
			
			// Refresh model so that SAPUI5 refreshes bindings
			oModel.refresh();			
		},
		
		handleSuggestionClusterManagersSelected: function(oEvent){
			
			// Retrieve selected items
			var aSelectedItem = oEvent.getParameter("selectedItem");
			var oModel = this.getView().getModel();
			
			if (aSelectedItem) {
				var clusterManagersToken = oModel.getProperty("/filters/clusterManagers");
				// Remove possible valueState Error
/*				var oSupplierInput = this.getView().byId("supplierFilterInput");
				oSupplierInput.setValueState(sap.ui.core.ValueState.None);	*/		
				
				for (var i = 0; clusterManagersToken[i]; i++){
					if (clusterManagersToken[i].supplierId === aSelectedItem.getKey()){
						var oBundle = this.getResourceBundle();
						MessageBox.error(
							oBundle.getText("alreadySelectedClusterManager")
						);	
						//Su Fiori questa parte di codice non è necessaria
/*						var supplierFilterInput = this.getView().byId("supplierFilterInput");
						var tokens = supplierFilterInput.getTokens();
						supplierFilterInput.removeToken(tokens[tokens.length - 1].getId());*/
						return;
					}
				}				
					
				var oSelectedClusterManagers = {
					"Name1" : aSelectedItem.getText(),
					"Username" : aSelectedItem.getKey()
				};
				oModel.getProperty("/filters/clusterManagers").push(oSelectedClusterManagers);
			}
			
			// Refresh model so that SAPUI5 refreshes bindings
			oModel.refresh();			
		},		
		
		/**
		 * Manage value help dialog window opening
		 */ 
		handleSupplierValueHelpPress: function(oEvent){
			this._showValueHelp("supplier", oEvent);
		},
		
		_handleSupplierValueHelpSearch : function (oEvent) {
			this._supplierSearch = oEvent.getParameter("value");
			if (this._supplierSearch .length >= 3){
				
				if (!this._firstTimeSupplierDialog){
					
					var objListItem = new sap.m.ObjectListItem(
						{
							title:"{oDataModel>Name1}",
							attributes : [new sap.m.ObjectAttribute({
								title:"{i18n>code}",	
                                text: "{oDataModel>SupplierId}"
                        	})]
						}
					);
					
					this._supplierValueHelpDialog.bindAggregation(
						"items", 
						"oDataModel>/SupplierSet", 
						objListItem
					);	
					this._firstTimeSupplierDialog = true;
				}

				var oFilter = [ 
					new Filter(
						"Name1",
						sap.ui.model.FilterOperator.Contains, 
						this._supplierSearch
					)
				];
				oEvent.getSource().getBinding("items").filter(oFilter);		
				this.sFilterPath = "/filters/suppliers";
			} 
		},
 
		_handleSupplierLiveChangeSearch : function(oEvent) {
			var sValue = oEvent.getParameter("value");
			if (sValue.length < 3){
				oEvent.getSource().setNoDataText(this.getTranslation("atLeast3CharError"));
			} else {
				oEvent.getSource().setNoDataText("");
			}
		},

		handleClusterManagersValueHelpPress: function(oEvent){
			this._showValueHelp("cluster-managers", oEvent);
		},
		
		_showValueHelp: function(sType, oEvent){
			
			var oVHD	= null,
				oModel	= this.getView().getModel(),
				aSelected = [];
			
			switch(sType){
				
				case "supplier":
					var searchString = this.searchSupplierString;
					
					// create value help dialog
					if (!this._supplierValueHelpDialog) {
						this._supplierValueHelpDialog = sap.ui.xmlfragment(
							"org.fater.app.view.fragment.SuppliersInputAssistedDialog",
							this
						);
						
						//Change type toolbar buttons
						var dialog = this._supplierValueHelpDialog._dialog;
						dialog.getButtons()[0].setType("Accept");
						dialog.getButtons()[1].setType("Reject");								
						this.getView().addDependent(this._supplierValueHelpDialog);
					}	
					
					oVHD = this._supplierValueHelpDialog;
					this.sPropertyName = "Name1";
					this.sFilterPath = "/filters/suppliers";
					
					aSelected = _.pluck(oModel.getProperty(this.sFilterPath), this.sPropertyName);
				break;
					
				case "cluster-managers":
					// create value help dialog
					if (!this._clusterManagersValueHelpDialog) {
						this._clusterManagersValueHelpDialog = sap.ui.xmlfragment(
							"org.fater.app.view.fragment.ClusterManagersInputAssistedDialog",
							this
						);
						
						//Change type toolbar buttons
						var dialog = this._clusterManagersValueHelpDialog._dialog;
						dialog.getButtons()[0].setType("Accept");
						dialog.getButtons()[1].setType("Reject");						
						this.getView().addDependent(this._clusterManagersValueHelpDialog);
					}
					
					oVHD = this._clusterManagersValueHelpDialog;
					this.sPropertyName = "Role";
					this.sFilterPath = "/filters/clusterManagers";
					
					aSelected = _.pluck(oModel.getProperty(this.sFilterPath), this.sPropertyName);
				break;
			}
			
			var oMultiInput = oEvent.getSource(),
				oTokens		= oMultiInput.getTokens(),
				oToken		= null,
				sInputValue = "",
				aFilters	= [];
				
			this.sInputId	= oEvent.getSource().getId();
			
			for (var i in oTokens){
				oToken = oTokens[i];
				sInputValue = oToken.getText();
				
				if (sInputValue.lastIndexOf(" - ") !== -1){
					sInputValue = sInputValue.substr(0, sInputValue.lastIndexOf(" - "));
				}
				
				aFilters.push(
					new Filter(
						this.sPropertyName,
						sap.ui.model.FilterOperator.NE, 
						sInputValue
					)
				);
			}
			
			if (oVHD.getBinding("items") && searchString){
				oVHD.getBinding("items").filter(aFilters);		
				this.aDialogFilters = aFilters;
				oVHD.open(searchString);
			}	else {
				oVHD.open();
			}	
			
			var aItems = oVHD.getItems();
			for (var j in aItems){
				if (jQuery.inArray(aItems[j].getTitle(), aSelected) !== -1){
					aItems[j].setSelected(true);
				}
			}
			
		},
		
		_handleValueHelpSearch : function (oEvent) {
			this.searchString = oEvent.getParameter("value");
			var	oFilter = new Filter(
					this.sPropertyName,
					sap.ui.model.FilterOperator.Contains, 
					this.searchString
				);
				
			if (this.searchString.length >=3){
				oEvent.getSource().getBinding("items").filter([oFilter]);
			} 			
		},		
		
		_handleSupplierValueHelpClose : function (oEvent) {
			// Retrieve selected items
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var oModel = this.getView().getModel();
			
			if (aSelectedItems && aSelectedItems.length > 0) { //At least one supplier or was selected by the user
				var oSupplierInput = this.getView().byId(this.sInputId);
				oModel.setProperty(this.sFilterPath,[]);
				for (var i in aSelectedItems){
					/* 
					* Iterate selected suppliers and add them to the model
					* (indirect binding will update graphic control's tokens)
					*/
					var oSelectedSupplier = aSelectedItems[i].getBindingContext("oDataModel").getObject();
					oModel.getProperty(this.sFilterPath).push(oSelectedSupplier);
					
				}
				// Remove possible valueState Error
				oSupplierInput.setValueState(sap.ui.core.ValueState.None);
			}
			
			// Refresh model so that SAPUI5 refreshes bindings
			oModel.refresh();
			// Empty filter
			oEvent.getSource().getBinding("items").filter([]);
		},
		
		_handleClusterManagerValueHelpClose : function (oEvent) {
			// Retrieve selected items
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var oModel = this.getView().getModel();
			
			if (aSelectedItems && aSelectedItems.length > 0) { //At least one supplier or was selected by the user
				var oSupplierInput = this.getView().byId(this.sInputId);
				oModel.setProperty(this.sFilterPath,[]);
					
				for (var i in aSelectedItems){
					/* 
					* Iterate selected suppliers and add them to the model
					* (indirect binding will update graphic control's tokens)
					*/
					var oSelectedSupplier = aSelectedItems[i].getBindingContext("oUserModel").getObject();
					oModel.getProperty(this.sFilterPath).push(oSelectedSupplier);
				}
				// Remove possible valueState Error
				oSupplierInput.setValueState(sap.ui.core.ValueState.None);
			}
			
			// Refresh model so that SAPUI5 refreshes bindings
			oModel.refresh();
			// Empty filter
			oEvent.getSource().getBinding("items").filter([]);
		},
		
		_handleDeleteSupplierToken: function(oEvent) {
			if (oEvent.getParameter("type") === "removed"){
				var oModel = this.getView().getModel();
				var supplierKey = oEvent.getParameter("token").getKey();
				var splittedKey = supplierKey.split("/");
				var supplierId = splittedKey[0];
				var supplierTokenArray = oModel.getProperty("/filters/suppliers");
				oModel.setProperty(
					"/filters/suppliers", 
					$.grep(supplierTokenArray, 
						function(e){ 
							return e.supplierId !== supplierId;
						}
					)
				);				
			}
		},
		
		_handleDeleteClusterManagerToken: function(oEvent) {
			var oModel = this.getView().getModel();
			var clusterManagerId = oEvent.getSource().getKey();
			var clusterManagersTokenArray = oModel.getProperty("/filters/clusterManagers");
			oModel.setProperty(
				"/filters/clusterManagers", 
				$.grep(clusterManagersTokenArray, 
					function(e){ 
						return e.Username !== clusterManagerId;
					}
				)
			);
		},		
		
		onFilterBarReset: function (oEvent){
			var oModel = this.getView().getModel();
			var oDefaultFilters = JSON.parse(JSON.stringify(oModel.getProperty("/defaultFilters")));
			
			oModel.setProperty("/filters", oDefaultFilters);
			this._eraseDatePickerValueStates();
		},

		onFilterBarSearch: function (oEvent){
			var that = this,
				oView = this.getView(),
				oModel = oView.getModel(),
				aSuppliers 			= oModel.getProperty("/filters/suppliers"),
				oDateFrom			= oModel.getProperty("/filters/lowerBoundDate"),
				oDateTo 			= oModel.getProperty("/filters/upperBoundDate"),
				oBundle = this.getResourceBundle();
				
			var oSupplierInput = oView.byId("supplierFilterInput");
			oSupplierInput.setValueState(sap.ui.core.ValueState.None);					

			if (aSuppliers.length === 0) {
				MessageBox.error(
					oBundle.getText("noSupplierSelectedErrorMessage")
				);
				oSupplierInput.setValueState(sap.ui.core.ValueState.Error);
				return;
			}
			
			if (!this._checkIfAllIsOK()){
				MessageBox.error(
					oBundle.getText("unableToProceedErrorMessage")
				);
				return;
			}
				
			if (!oDateFrom && !oDateTo){
				var dialog = new sap.m.Dialog({
					title: that.getTranslation("warning"),
					type: 'Message',
					content: new sap.m.Text({ 
						text: that.getTranslation("confirmNoDateMessage"), 
						textAlign: "Center"
					}),
					beginButton: new sap.m.Button({
						type: "Accept",
						text: that.getTranslation("confirm"),
						press: function () {
							dialog.close();
							that.onFilterBarSearchConfirm(oEvent);
						}
					}),
					endButton: new sap.m.Button({
						type: "Reject",
						text: that.getTranslation("cancel"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
	 
				dialog.open();			
			} else {
				this.onFilterBarSearchConfirm(oEvent);
			}
		},
		
		onFilterBarSearchConfirm: function (oEvent){
			var oView = this.getView(),
				oDataModel = oView.getModel("oDataModel"),
				oModel = oView.getModel(),
				oTempModel = oView.getModel("tempModel");
			
			// Retrieve all query parameters
			var aSuppliers 			= oModel.getProperty("/filters/suppliers") ,
				aClusterManagers	= oModel.getProperty("/filters/clusterManagers"),
				oDateFrom			= oModel.getProperty("/filters/expireStartDate"),
				oDateTo 			= oModel.getProperty("/filters/expireEndDate"),
				sSupplierStatus		= oModel.getProperty("/filters/supplierStatus"),
				oExpireCheck		= oModel.getProperty("/filters/expireCheck"),
				oFilterBar			= this.getView().byId("supplierFilterBar"),
				oBundle 			= this.getResourceBundle();

			var aFilters = [];
			
			// Iterate through selected suppliers to retrieve IDs
			var aSupplierIDs = [];
			for (var j in aSuppliers){
				aSupplierIDs.push(new sap.ui.model.Filter("SupplierId", sap.ui.model.FilterOperator.EQ, aSuppliers[j].SupplierId));
			}
			
			aSupplierIDs = new sap.ui.model.Filter(aSupplierIDs, false);
			aFilters.push(aSupplierIDs);
			
			var aClusterManagersIDs = [];
			for (var y in aClusterManagers){
				aClusterManagersIDs.push(new sap.ui.model.Filter("RespCluster", sap.ui.model.FilterOperator.EQ, aClusterManagers[y].Username));
			}
			
			if (aClusterManagersIDs.length > 0){
				var aClusterManagersFilters = new sap.ui.model.Filter(aClusterManagersIDs, false);
				aFilters.push(aClusterManagersFilters);						
			}
			
			if (oDateFrom && oDateTo){
				//+1 For timezone conversion
				oDateTo.setDate(oDateTo.getDate() + 1);		
				oDateFrom.setDate(oDateFrom.getDate() + 1);					
				
				var dateTo = new Date(oDateTo);
				var monthTo = dateTo.getMonth() + 1;
				var formattedDateTo = dateTo.getFullYear().toString();
				if (monthTo < 10){
					formattedDateTo += "0" + monthTo.toString();
				} else {
					formattedDateTo += monthTo.toString();
				}
				if (dateTo.getDate() < 10){
					formattedDateTo += "0" + dateTo.getDate().toString();
				} else {
					formattedDateTo += dateTo.getDate().toString();
				}			
				
				var dateFrom = new Date(oDateFrom);
				var monthFrom = dateFrom.getMonth() + 1;
				var formattedDateFrom = dateFrom.getFullYear().toString(); 
				if (monthFrom < 10){
					formattedDateFrom += "0" + monthFrom.toString();
				} else {
					formattedDateFrom += monthFrom.toString();
				}
				if (dateFrom.getDate() < 10){
					formattedDateFrom += "0" + dateFrom.getDate().toString();
				} else {
					formattedDateFrom += dateFrom.getDate().toString();
				}
				
				var oDateFilter = new sap.ui.model.Filter({
				   path: "ExpireDate",
				   operator: sap.ui.model.FilterOperator.BT,
				   value1: formattedDateFrom,
				   value2: formattedDateTo
				});
				aFilters.push(oDateFilter);
				
				oDateTo.setDate(oDateTo.getDate() - 1);
				oDateFrom.setDate(oDateFrom.getDate() - 1);					
			} else {
				if (oDateFrom){
					//GT For timezone conversion
					
					var dateFrom = new Date(oDateFrom);
					var monthFrom = dateFrom.getMonth() + 1;
					var formattedDateFrom = dateFrom.getFullYear().toString(); 
					if (monthFrom < 10){
						formattedDateFrom += "0" + monthFrom.toString();
					} else {
						formattedDateFrom += monthFrom.toString();
					}
					if (dateFrom.getDate() < 10){
						formattedDateFrom += "0" + dateFrom.getDate().toString();
					} else {
						formattedDateFrom += dateFrom.getDate().toString();
					}
				
					var oDateFromFilter = new sap.ui.model.Filter("ExpireDate", sap.ui.model.FilterOperator.GT, formattedDateFrom);
					aFilters.push(oDateFromFilter);
				}
				
				if (oDateTo){
					//+1 For timezone conversion
					oDateTo.setDate(oDateTo.getDate() + 1);	
					
					var dateTo = new Date(oDateTo);
					var monthTo = dateTo.getMonth() + 1;
					var formattedDateTo = dateTo.getFullYear().toString();
					if (monthTo < 10){
						formattedDateTo += "0" + monthTo.toString();
					} else {
						formattedDateTo += monthTo.toString();
					}
					if (dateTo.getDate() < 10){
						formattedDateTo += "0" + dateTo.getDate().toString();
					} else {
						formattedDateTo += dateTo.getDate().toString();
					}
				
					var oDateToFilter = new sap.ui.model.Filter("ExpireDate", sap.ui.model.FilterOperator.LE, formattedDateTo);
					aFilters.push(oDateToFilter);
					oDateTo.setDate(oDateTo.getDate() - 1);
				}				
			}
			
			if (sSupplierStatus && sSupplierStatus !== "all"){
				var sSupplierStatusFilter = new sap.ui.model.Filter("SupplierStatus", sap.ui.model.FilterOperator.EQ, sSupplierStatus);
				aFilters.push(sSupplierStatusFilter);
			}
			
			//if checkbox is selected retrieve all the documents
			if (!oExpireCheck){
				var oExpireCheckFilter = new sap.ui.model.Filter("ExpireCheck", sap.ui.model.FilterOperator.EQ, true);
				aFilters.push(oExpireCheckFilter);
			} 
			
			if (aClusterManagersFilters || oDateFromFilter || oDateToFilter || sSupplierStatusFilter){
				aFilters = [new sap.ui.model.Filter(aFilters, true)];				
			}
			
			var sPath = "/ScadenziarioSet";
			var	mParameters = {
				filters : aFilters,
                success : function (oData) {
                	
                	var aDocuments = oData.results;

					if (aDocuments.length === 0){
						MessageBox.information(
							oBundle.getText("noDocumentsMessage")
						);							
					} else {
						
						// Set invoices retrieved from back-end 
						oModel.setProperty(
							"/documents", 
							aDocuments
						);

						oTempModel.setProperty("/documentsCount", oData.results.length);						
						oFilterBar.setFilterBarExpanded(false);
							
						oTempModel.setProperty(
							"/dataLoaded",
							true
						);						
					}
  
					oView.setBusy(false);
                },
                error: function (oError) {
                    jQuery.sap.log.info("Odata Error occured");
                    oView.setBusy(false);
                }
            };			
            oView.setBusy(true);
			oDataModel.read(sPath, mParameters);			

			// Get selected Suppliers & Cluster managers IDs
			var aSupplierIDs = _.pluck(
					aSuppliers, 
					"SupplierId"
				),
				aClusterManagersIDs = _.pluck(
					aClusterManagers, 
					"ManagerId"
				);
			
			// Disable user interactions
			oView.setBusy(true);
			oTempModel.setProperty("/dataLoaded",false);
		},
		
		_eraseDatePickerValueStates: function(){
			var oDP1 = this.getView().byId("filterLowerBoundDatePicker"),
				oDP2 = this.getView().byId("filterUpperBoundDatePicker");
			
			oDP1.setValueState(sap.ui.core.ValueState.None);
			oDP2.setValueState(sap.ui.core.ValueState.None);
		},
		
		handleDatePickerChange:function (oEvent){
					
			var oDP = oEvent.getSource();
			var oSelectedDate = oDP.getDateValue();
			var today = new Date(); 
			this._eraseDatePickerValueStates();
			
			var sPath = "/filters/";
			var oModel = this.getView().getModel();
			var oBundle = this._getBundle();
			
			if(oDP.getId().toLowerCase().indexOf("lower") !== -1){
				// check if lower date is greater than upper date
				var oUpperDate = oModel.getProperty("/filters/expireStartDate");
				
				if (oSelectedDate > today){
					MessageBox.error(
						oBundle.getText("dateAreNotValidErrorMessage")
					);
					oDP.setValueState(sap.ui.core.ValueState.Error);					
				}
				
				if (oUpperDate && (oSelectedDate > oUpperDate)){
					MessageBox.error(
						oBundle.getText("dateAreNotValidErrorMessage")
					);
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
				
				sPath += "expireStartDate";
			}
			else{
				// check if upper date is lower than lower date
				var oLowerDate = oModel.getProperty("/filters/expireEndDate");
				
				if (oLowerDate && (oSelectedDate < oLowerDate)){
					
					MessageBox.error(
						oBundle.getText("dateAreNotValidErrorMessage")
					);
					
					oDP.setValueState(sap.ui.core.ValueState.Error);
				}
				sPath += "expireEndDate";
			}
			oModel.setProperty(sPath, oSelectedDate);
		},

		_checkIfAllIsOK: function(){
			var oView = this.getView();
			
			var oDP1 = oView.byId("filterLowerBoundDatePicker"),
				oDP2 = oView.byId("filterUpperBoundDatePicker"),
				oDP1Date = new Date(oDP1.getValue()),
				today = new Date();
				
			if ( oDP1.getValue() !== undefined && oDP1Date > today){
				oDP1.setValueState("Error");
			}	
				
			return	(oDP1.getValueState() !== sap.ui.core.ValueState.Error) && 
					(oDP2.getValueState() !== sap.ui.core.ValueState.Error) &&
					(oDP1.getValue() !== undefined || oDP1Date <= today);
		},
		
		onTablePersonalizationButtonPressed: function(oEvent){
			if (!this._personalizationDialog){
				this._personalizationDialog = sap.ui.xmlfragment(
					"org.fater.app.view.fragment.TablePersonalizationDialog",
					this
				);
				this.getView().addDependent(this._personalizationDialog);
			}
			
			// this._personalizationDialog.setMultiSelect(true);
			
			this._personalizationDialog.open();
		},
		
		handleTablePersonalizationDialogOKButtonPress: function (oEvent) {
			this._personalizationDialog.close();
		},

		onTableSortingButtonPressed: function (oEvent){
			this._getDialog().open("sort");
		},
		
		_getDialog : function () {
			if (!this._oTableVSDialog) {
				this._oTableVSDialog = sap.ui.xmlfragment("org.fater.app.view.fragment.ViewSettingsDialog", this);
				this.getView().addDependent(this._oTableVSDialog);
			}
			return this._oTableVSDialog;
		},	
		
		_handleConfirm: function(oEvent){
			var oBinding = this.getView().byId("documentsTable").getBinding("items");
			var sortItem = oEvent.getParameter("sortItem").getKey();
			var aSorters = [];
			if (oEvent.getParameter("groupItem")) {
				var groupKey = oEvent.getParameter("groupItem").getKey();
				var bDescending = oEvent.getParameter("groupDescending");
				aSorters.push(new Sorter(groupKey, bDescending, this._mGroupfunction(groupKey)));
			}
			var sOrder = oEvent.getParameter("sortDescending");
			aSorters.push(new Sorter(sortItem, sOrder));
			oBinding.sort(aSorters);
		},	
		
		_mGroupfunction: function (groupKey){
			return function(oContext) {
				var value = oContext.getProperty(oContext.sPath + "/" + groupKey);
				var text = value;
				var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				var sRootPath = jQuery.sap.getModulePath("org.fater.app");
				
				if (!this._bundle){
					this._bundle = jQuery.sap.resources({
						url : sRootPath + "/i18n/i18n.properties", 
						locale: sLanguage
					});
				}
				
				switch (groupKey){
					case "MandatoryDoc":
						text = (value === "") ? this._bundle.getText("notMandatoryDocLabel") : this._bundle.getText("mandatoryDocLabel");
						break;
						
					case "Status":
						if (value === "1"){
							text = this._bundle.getText("inProcess");
						}
						if (value === "2"){
							text = this._bundle.getText("aboutToExpire");
						}
						if (value === "3"){
							text = this._bundle.getText("expired");
						}						
						break;		
		
					case "SupplierStatus":
						if (value === "BIDDER"){
							text = this._bundle.getText("supplierStatusesBidderLabel");							
						} else {
							//POTENTIAL_BIDDER and SUPPLIER are grouped together 
							value="SUPPLIER";
							text = this._bundle.getText("supplierStatusesCodedLabel");
						}						
						break;
						
					default:
						break;
				} 
				return {
					key: value,
					text: text
				};
			};
		},
		
		/**
		 * CSV Export
		 */
		onExcelExportButtonPressed: function (oEvent){
			
			var oModel		 = this.getView().getModel(),
				aDocuments	 = oModel.getProperty("/documents"),
				sReportTitle = "Report Scadenzario documenti";
			
			var sCSV = this._generateCSVData(
				aDocuments,
				sReportTitle
			);
			
			this._downloadCSVFile (
				sReportTitle,
				sCSV
			);
		},
		
		/**
		 * CSV Creation
		 */
		_generateCSVData: function(aLines, sReportTitle){
			
			var sCSV = '',
				oBundle = this._getBundle();
			
		    //Set Report title in first row or line
		    
		    sCSV += sReportTitle + '\r\n';
		    
		    //Generate the Header of line items table structure
	        var row = "";
	        
            row +=	oBundle.getText("docStatusLabel")			+ ";" +
					oBundle.getText("docExpireLabel")			+ ";" +
					oBundle.getText("docDescriptionLabel")		+ ";" +
					oBundle.getText("docMandatoryLabel")		+ ";" +
					oBundle.getText("docSupplierStatusLabel")	+ ";" +
					oBundle.getText("docSupplierIdLabel")		+ ";" +
					oBundle.getText("docSupplierNameLabel")		+ ";" +
					oBundle.getText("docClusterLable")			;
	
	        //append Label row with line break
	        sCSV += row + '\r\n';
	        
		    //1st loop is to extract each row
		    for (var i = 0; i < aLines.length; i++) {
		        
		        var mandatoryDoc = (aLines[i].MandatoryDoc.length > 0) ? "Si" : "No";
		         
		        row = "";
		        
		        
		        row +=	((aLines[i].Status)			?	aLines[i].Status			:	" ")	+ ";" +
						((aLines[i].RemainingDays) 	?	aLines[i].RemainingDays		:	" ")	+ ";" +
						((aLines[i].Value)			?	aLines[i].Value				:	" ")	+ ";" +
						((mandatoryDoc)				?	mandatoryDoc				:	" ")	+ ";" +
						((aLines[i].SupplierStatus)	?	aLines[i].SupplierStatus	:	" ")	+ ";" +
						((aLines[i].SupplierId) 	?	aLines[i].SupplierId		:	" ")	+ ";" +
						((aLines[i].Name1)			?	aLines[i].Name1				:	" ")	+ ";" +
						((aLines[i].Name)			?	aLines[i].Name				:	" ")	;
						
		        // row.slice(0, row.length - 1);
		        
		        //add a line break after each row
		        sCSV += row + '\r\n';
		    }
		
		    if (sCSV == '') {        
		        MessageBox.error("Invalid data");
		        return;
		    }   
		    
		    return sCSV;
			
		},
		
		/**
		 * CSV Download
		 */
		_downloadCSVFile: function(sReportTitle,sCSV){
			//Generate a file name
		    //this will remove the blank-spaces from the title and replace it with an underscore
		    var sFileName = sReportTitle.replace(/ /g,"_");   
		    
		    //Initialize file format you want csv or xls
		    var uri = 'data:text/csv;charset=utf-8,' + escape(sCSV);
		    
		    // Now the little tricky part.
		    // you can use either>> window.open(uri);
		    // but this will not work in some browsers
		    // or you will not get the correct file extension    
		    
		    //this trick will generate a temp <a /> tag
		    var link = document.createElement("a");    
		    link.href = uri;
		    
		    //set the visibility hidden so it will not effect on your web-layout
		    link.style = "visibility:hidden";
		    link.download = sFileName + ".csv";
		    
		    //this part will append the anchor tag and remove it after automatic click
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		},
		
		onTableGroupingButtonPressed: function (oEvent){
			this._getDialog().open("group");
		},
		
		_getBundle: function(){
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			var sRootPath = jQuery.sap.getModulePath("org.fater.app");
			
			if (!this._bundle){
				this._bundle = jQuery.sap.resources({
					url : sRootPath + "/i18n/i18n.properties", 
					locale: sLanguage
				});
			}
			
			return this._bundle;
		},		
		
		handleDocumentPress: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			var supplierId  = this.getView().getModel().getProperty(path + "/SupplierId");	
			var fileName = oEvent.getSource().getText();
			oEvent.getSource().setTarget("_blank");
			oEvent.getSource().setHref("/sap/opu/odata/sap/ZVIP_PROJECT_SRV/FileSet(FileName='" + fileName + "',Supplier='" + supplierId + "')/$value");			
		},
		
		handleSupplierIdPress: function (oEvent) {
			try{
				var sPath = oEvent.getSource().getBindingContext().getPath();
				var participationId  = this.getView().getModel().getProperty(sPath + "/ParticipationId");
				var href = sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({
				  target : { semanticObject : "Supplier", action : "display" }
//				  params : { "ParticipationId" : participationId}
				});
				href = href + "&/ParticipationSet('" + participationId + "')/Detail";
				window.open(href);
			} catch(e) {
				MessageToast.show("Navigazione a Gestione anagrafiche fornitore in Albo");				
			}			
		},
		
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		/**
		 * Get the translation for sKey
		 * @public
		 * @param {string} sKey the translation key
		 * @param {array} aParameters translation paramets (can be null)
		 * @returns {string} The translation of sKey
		 */
		getTranslation: function (sKey, aParameters) {
			if( aParameters === undefined || aParameters === null ) {
				return this.getResourceBundle().getText(sKey);
			} else {
				return this.getResourceBundle().getText(sKey, aParameters);
			}
		},
		
		_getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}			
		
	});

});