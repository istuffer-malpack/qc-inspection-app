var app = angular.module("app", []);

app.factory("overviewService", function($http) {
  var service = {};
  var gUrl = "https://script.google.com/macros/s/AKfycby0ogE4p9Yj9Ke9OpZExmHB7silCuLW0McKcjFuYC76tHyhu4A/exec?sheet=";

	service.getAllOrders = function(){
		return $http.get('http://10.4.3.15:8080/api/PSOrder/');
	};
	service.getAllQcData = function() {
		return $http.get(gUrl + "QC_IMPORT");
    };
	service.getBarcodes = function(){
		return $http.get('http://10.4.3.15:8081/api/BarcodeOrders/');
	};	
	service.getBom = function(){
		return $http.get(gUrl + "bom");
	};
	service.getStartStop = function(){
		return $http.get('http://10.4.3.15:8083/api/ProdStatus');
	};
	service.getProductRecipe = function(){
		return $http.get(gUrl + "recipeCode");
	};

  return service;
});

app.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
                      iElement.trigger('input');
                    }, 0);
                }
            });
    };
}).controller("overviewController", [ "$scope","$log","$interval","$timeout","$http","$filter","overviewService",

	function($scope, $log, $interval, $timeout, $http, $filter, overviewService) {
		var init = function() {
			
			$scope.loadingInfo = true;
			$scope.keyword;			
			$scope.machineLine = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4', 'LINE 5', 'LINE 6', 'LINE 7', 'LINE 8', 'LINE 9'];
			$scope.lineNumber = 'all';
			$scope.allScheduled;
			$scope.schedule;
			$scope.qcData;
			$scope.bom;
			$scope.bomItem;
			$scope.currentRunOrders;
			$scope.ordernumber;
			$scope.boxCardboard;
			$scope.coreSize;
			$scope.itemClassification;
			$scope.specialInstruction;
			$scope.recipeCode;
			$scope.pallet;
			$scope.rollWt;
			$scope.rollConfiguration;
			$scope.search;
			$scope.lineOneBC;
			$scope.lineTwoBC;
			$scope.lineThreeBC;
			$scope.lineFourBC;
			$scope.lineFiveBC;
			$scope.lineSixBC;
			$scope.lineSevenBC;
			$scope.lineEightBC;
			$scope.lineNineBC;
			$scope.recipeCode;
			$scope.prodC;
			$scope.machineL;
			$scope.custID;
			$scope.followUpData;
			$scope.currentTime = new Date();
			var yesterday = new Date($scope.currentTime);
			var next_two_days = new Date($scope.currentTime);
			yesterday.setDate(yesterday.getDate() - 1); //2
			next_two_days.setDate(yesterday.getDate() + 2);
			next_two_days.toDateString()
			yesterday.toDateString();
			
			$scope.currentAsofTime = function(){
				return Date.now();		   
			};
			$interval(function() {$scope.currentAsofTime();}, 60 * 1000);
			var nowD = new Date($scope.currentAsofTime());
			
			$scope.getStartStopData = function(){
				overviewService.getStartStop().then(
				function successCallback(response) {
					$scope.startStopData = response.data; //.filter(function(results) { 
							//return (results.Status == 'Start' && results.Timestamp != null && (results.Line == 'LINE 1' || results.Line == 'LINE 2' || results.Line == 'LINE 3' || results.Line == 'LINE 4' || results.Line == 'LINE 5' || results.Line == 'LINE 6' || results.Line == 'LINE 7' || results.Line == 'LINE 8' || results.Line == 'LINE 9'))
						//});
						//$log.log($scope.startStopData);				
				},
					function errorCallback(response) {
						$log.log("Error");
					}
				);
			
			};
			
			//get orders
			$scope.getOrders = function(){
				overviewService.getAllOrders().then(
					function successCallback(response) {
						$scope.allScheduled = response.data;
						 $scope.schedule = response.data.filter(function(results) { 
							return (new Date(results.StartDate) >= new Date(yesterday) && new Date(results.StartDate) <= new Date(next_two_days))
						});
						
						var temp = $scope.schedule;
						$scope.schedule = temp.sort((a,b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime());
						
						test = $scope.schedule;
						var cc = [];
						var n = new Date();
						
						for(var i=0;i<test.length;i++){
							var a = new Date(test[i].StartDate);
							var b = new Date(test[i].EndDate);
							if(a.getTime() <= n.getTime() && b.getTime() >= n.getTime()){
								cc.push(test[i]);
							}
						}
						
						$scope.currentRunOrders = cc.sort((a,b) => parseInt((a.ScheduledLine).replace('LINE ','')) - parseInt((b.ScheduledLine).replace('LINE ','')));	
						$scope.loadingInfo = false;
					},
					function errorCallback(response) {
						$log.log("Error");
					}
				);
			};			
			
			
			$scope.getBom = function(){
				overviewService.getBom().then(
				function successCallback(response) {
					$scope.bom = response.data.records;						
				},
					function errorCallback(response) {
						$log.log("Error");
					}
				);
			
			};
			
			$scope.getProductRecipe = function(){
				overviewService.getProductRecipe().then(
				function successCallback(response) {
					$scope.recipeList = response.data.records;						
				},
					function errorCallback(response) {
						$log.log("Error");
					}
				);
			
			};
			
			
			
			//get barcodes
			$scope.barcodes = function(){
			   overviewService.getBarcodes().then(
				function successCallback(response) {
					$scope.barcodeData = response.data.filter(function(results) { 
											return results.QPBarcode != null
										});					
										
				},
				function errorCallback(response) {
				  $log.log("Error");
				}
			  );
			};		
			
			$scope.getQC = function(){
				   overviewService.getAllQcData().then(
					function successCallback(response) {
					  $scope.qcData = response.data.records;
					},
					function errorCallback(response) {
						$log.log("Error");
					}
				);
			};
			
			
			$scope.isStartedOrDone = function(uKey){
				try{
					var data = $scope.startStopData;
					var response = '';
					var started = false;
					var isDone = false;
					var timestamp = '';
					if(data.length > 0){
						for(var i=0;i<data.length;i++){
							if(data[i].UniquifierKey == uKey){
								if(data[i].Status == 'Start' && data[i].Timestamp != null){
									started = true;
									timestamp = data[i].Timestamp;
								}
								if(data[i].Status == 'End' && data[i].Timestamp != null){
									isDone = true;
								}
								
							} 
						}
						if(started && !isDone){
							response = 'started/'+timestamp;
						}else if(started && isDone){
							response = 'done';
						}else if(!started && isDone){
							response = 'done';
						}else{
							response = '';
						}
					}
						return response;
				}catch(e){
					return '';
				}
			};
			
			$scope.getOrders();
			$scope.getStartStopData();	
			//$scope.barcodes();			
			$scope.getQC();
			$scope.getProductRecipe();
			
			$interval(function() {
				//$scope.getOrders();
				//$scope.getStartStopData();
				//$scope.barcodes();
				$scope.getQC();
				//$scope.getProductRecipe();
			}, 5 * 60 * 1000);
			
						
			$scope.$watch('schedule', function(newValue, oldValue, scope) {
				return $scope.schedule;
			}, true);
			
			$scope.$watch('qcData', function(newValue, oldValue, scope) {
				return $scope.qcData;
			}, true);
			$scope.$watch('startStopData', function(newValue, oldValue, scope) {
				return $scope.startStopData;
			}, true);
			
			
			$scope.getBOMInfo = function(customer,product,info){
				var result="";
				if(typeof product !== 'undefined'){	
					for(var i=0;i<bom.length;i++){
						if(bom[i].Product_ID == product.trim() && bom[i].Customer_ID == customer.trim()){
							switch (info){
								case 'Customer_Name':
								result = bom[i].Customer_Name; 
								break;
								case 'Item_Classification':
								result = bom[i].Item_Classification;
								break;
								case 'Special_Comments':
								result = bom[i].Special_Comments;
								break;
								case 'UNIT_WT':
								result = bom[i].UNIT_WT;
								break;
								case 'PALLET':
								result = bom[i].PALLET;
								break;
								case 'CORE':
								result = bom[i].CORE;
								break;
								case 'BOX_CARDBOARD':
								result = bom[i].BOX_CARDBOARD;
								break;
								case 'RECIPE_CODE':
								result = bom[i].RECIPE_CODE;
								break;
								case 'Customer_Name':
								result = bom[i].Customer_Name;
								break;
								default:
								result = "";
							}
						}
					}	
				}
				return result;
			};
			
			$scope.inspectQc = function(data,l){
				//var line = x.ScheduledLine; 
				switch (l){
					case 'LINE 1':
					$scope.lineOneQc = data;	
					//$scope.lineOneBC = $scope.getBarcodeID(data.uniquifierKey,1);
					break;
					case 'LINE 2':
					$scope.lineTwoQc = data;
					break;
					case 'LINE 3':
					$scope.lineThreeQc = data;
					break;
					case 'LINE 4':
					$scope.lineFourQc = data;
					break;
					case 'LINE 5':
					$scope.lineFiveQc = data;
					break;
					case 'LINE 6':
					$scope.lineSixQc = data;
					break;
					case 'LINE 7':
					$scope.lineSevenQc = data;
					break;
					case 'LINE 8':
					$scope.lineEightQc = data;
					break;
					case 'LINE 9':
					$scope.lineNineQc = data;
					break;
					default:
					
				}
				//document.getElementById('line1Line').value = data.ScheduledLine;
				
				
				document.getElementsByClassName('tab')[parseInt(l.replace('LINE ',''))].click();
			};
				
			$scope.getBarcodeID = function(uKey,skidno){
				
				var bc = $scope.barcodeData.filter(function(results) { 
											return results.UniquifierKey == uKey
										});
				return bc[skidno - 1]
			
			
			};
			
			$scope.viewRecipe = function(prodId,line,customerId){
				
				var recipeData = $scope.recipeList;
				var temp = [];
				var count = 0;
				var recipe = "<p>No data available...</p>";	
				
				if(typeof(prodId) !== 'undefined'){
					var recipeCode = prodId.substr(0,4);
									
					
						for(var i=0;i<recipeData.length;i++){
							if(recipeData[i].LINE == line && recipeData[i].PRODUCT == prodId && recipeData[i].CUSTOMER == customerId){
								temp.push(recipeData[i].HTML_CODE);
								count++;
							}					
						}			
					
				}
				//recipe = '<table class="table is-fullwidth has-text-black"><tbody>' + recipeData[i].HTML_CODE + '</tbody></table>';
				if(count > 0){
					recipe = temp[0];
				}else{
					recipe = "<p>No data available...</p>";	
				}
				document.getElementById('recipeCode').innerHTML = recipe;
				//$scope.recipeCode = recipe;
			};
			
			$scope.getMachineSettings = function(s,mline,prod){
				try{	
					var qcdata = $scope.qcData.filter(function(results) { 
												return (results.PRODUCT_CODE).substr(0,12) == prod.substr(0,12) && results.LINE == mline 
											}).sort(function(a,b){return new Date(b.Timestamp) - new Date(a.Timestamp)});
					var qcResult = '';
					
					switch (s){
							case 'speed' :
								qcResult = qcdata[0].LINE_SPEED;
							break;
							case 'vacuum' :
								qcResult = qcdata[0].VACUUM_SETTINGS;
							break;
							case 'standardLimits' :
								qcResult = 'MIN:'+qcdata[0].MIN + ' TGT:' + qcdata[0].TGT + ' MAX:' + qcdata[0].MAX;
							break;
							default:
							qcResult = '';
					}
				}catch(e){
					qcResult = '';
				}
								
				return qcResult
			};
			
			$scope.viewHistory = function(machineLine,product,customer){
				$scope.qcHistory = $scope.qcData.filter(function(results) { 
											return (results.PRODUCT_CODE).substr(0,12) == product.substr(0,12) && results.LINE == machineLine 
										}).sort(function(a,b){return new Date(b.Timestamp) - new Date(a.Timestamp)});
				$scope.prodC = product;
				$scope.machineL = machineLine;
				$scope.custID = customer;
			};
			
			$scope.fixDate = function(d){
				return new Date(d);
			};
			
			$scope.followUpQc = function(data,line){
				$scope.followUpData = data;
				$('#followUpModal').addClass('is-active');
			};
			
			$scope.submitReport = function(ele){
				
			//console.log(ele);
				var checkboxes = $("."+ele+" .checkboxes");
				var selectedCboxes = Array.prototype.slice.call(checkboxes).filter(ch => ch.checked==true).map(ch => ch.value).join(); 
				$('.'+ele+' .qualityDefects').val(selectedCboxes.toString());
				//console.log($('.'+ele).serialize());
				//document.querySelector("."+ele+").setAttribute('action',url);
				$('.'+ele+' .formSubmit').addClass('is-loading');
				 $.ajax({
							url: 'https://script.google.com/macros/s/AKfycbwrDMxvS77G3Fc1KXlMuZYxNzmS3v5n9s-NLgtIZ59CS9m22W-N/exec',
							type: 'get',
							data: $('.'+ele).serialize(),
							success: function(data) {
								console.log(data);
								//reset form and display modal confirmation
								if(data.result == 'success'){										
									$('.'+ele).trigger("reset");
									$('.joUpload, .testUpload').html("");
									$('.'+ele+' .formSubmit').removeClass('is-loading');
								}else{
									alert("Oopss... something went wrong. Please try again.");
								}
								$('.'+ele+' .formSubmit').removeClass('is-loading');
							}
						}); 
			

				
			};
			
			$scope.correctiveActionSubmit = function(ele){
				$('#correctiveActionSubmit').addClass('is-loading');
				$.ajax({
							url: 'https://script.google.com/macros/s/AKfycbwrDMxvS77G3Fc1KXlMuZYxNzmS3v5n9s-NLgtIZ59CS9m22W-N/exec',
							type: 'get',
							data: $('#correctiveActionForm').serialize()+'&fromForm=correctiveAction',
							success: function(data) {
								console.log(data);
								//reset form and display modal confirmation
								if(data.result == 'success'){										
									$('#correctiveActionForm').trigger("reset");
									$('#followUpModal').removeClass('is-active');
								}else{
									alert("Oopss... something went wrong. Please try again.");
								}
								$('#correctiveActionSubmit').removeClass('is-loading');
							}
						}); 
			};
			
		};
		
	  init();
	}
]);