_hkscs
'use strict';

var commonMod = angular.module('ngInput.common', []);

commonMod.factory('ngInputLocalize', [ '$http', '$rootScope', function($http, $rootScope) {
  var localize = {
      
    forDev: false,
    localData: {
      "min" : "Input value too small",
      "max" : "Input value too big",
      "pattern" : "Input format is incorrect",
      "email" : "Invalid email format",
      "required" : "Required DEV DEV",
      "valid" : "Valid input",
      "compareTo" : "Not same as New Password",
      "pwStrength" : "Password strenght smaller than 50",
      "remainingQty" : "Remaining quantity too small",
      "duplicated" : "Cannot be duplicated"
    },
    
    langFileUrl: "/assets/js/ngInput/langs/", 
    
    currentLocaleData : {},
    currentLang : {
      language : "English",
      translation : "English",
      langCode : "en",
      flagCode : "us"
    },
    
    setLang : function(lang) {
      
      if (localize.forDev) {
        
        localize.currentLocaleData = localize.localData;
        localize.currentLang = lang;
        $rootScope.$broadcast('localizeLanguageChanged');
        
        
      } else {
        $http({
          method : 'GET',
          url : localize.getLangUrl(lang),
          cache : false
        }).success(function(data) {
          localize.currentLocaleData = data;
          localize.currentLang = lang;
          $rootScope.$broadcast('localizeLanguageChanged');
        }).error(function(/* data */) {
          console.log('Error updating language!');
        });
      }
    },
    getLangUrl : function(lang) {
      return localize.langFileUrl + lang.langCode + '.js';
    },

    localizeText : function(sourceText) {
      return localize.currentLocaleData[sourceText];
    }
  };

  return localize;
} ]);

var mod = angular.module('ngInput', [ 'ngInput.common' ]);

mod.directive('addValidation', [ '$q', '$timeout', function($q, $timeout) {
  return {
    require : 'ngModel',

    link : function(scope, elm, attrs, ctrl) {

      if (angular.isDefined(scope.validators)) {
        for ( var key in scope.validators) {
          ctrl.$validators[key] = scope.validators[key];
        }
      }

      if (angular.isDefined(scope.asyncValidators)) {
        for ( var key in scope.asyncValidators) {
          ctrl.$asyncValidators[key] = scope.asyncValidators[key];
        }
      }

    }
  };
} ]);

mod.directive('ngInputText', [ '$q', '$timeout', 'ngInputLocalize', function($q, $timeout, ngInputLocalize) {
  return {
    restrict : 'E',

    scope : {
      bindModel : "=",
      pattern : "@?",
      type : "@?",
      validators : "=?",
      asyncValidators : "=?",
      popoverAppendToBody : "@?",
      popoverPlacement : "@?"
    },

    
    templateUrl : 'ngInputTextTemplate.html',
    controller : function($scope) {

      $scope.modelOptions = angular.isDefined($scope.asyncValidators) ? {
        'updateOn' : 'default blur',
        'debounce' : {
          'default' : 400,
          'blur' : 0
        }
      } : {
        'updateOn' : 'default blur',
        'debounce' : {
          'default' : 0,
          'blur' : 0
        }
      };
      $scope.pattern = angular.isDefined($scope.pattern) ? $scope.pattern : "^.+$";
      $scope.type = angular.isDefined($scope.type) ? $scope.type : "text";
      $scope.popoverAppendToBody = angular.isDefined($scope.popoverAppendToBody) ? $scope.popoverAppendToBody : "true";
      $scope.popoverPlacement = angular.isDefined($scope.popoverPlacement) ? $scope.popoverPlacement : "right";

    },
    link : function(scope, elm, attrs, ctrl) {

      scope.inputValidationPopover = {
        control : {}
      };

      scope.initInputValidationPopover = function(control) {
        scope.inputValidationPopover.control = control;
      }

      scope.getLocalizedText = function(key) {
        return ngInputLocalize.localizeText(key);
      }

    }
  };
} ]);

mod
    .run([
        'ngInputLocalize',
        '$templateCache',

        function(ngInputLocalize, $templateCache) {
          //ngInputLocalize.forDev = true;
          ngInputLocalize.setLang(ngInputLocalize.currentLang);
          

          var popoverTpl = '<div style="min-width:100px">\
                      <div ng-if="inputValidationPopover.control.$invalid">\
                        <li ng-repeat="(key, value) in inputValidationPopover.control.$error">\
                          {{getLocalizedText(key);}}\
                        </li>\
                      </div>\
                      <div ng-if="inputValidationPopover.control.$valid">\
                        <li>\
                          {{getLocalizedText("valid");}}\
                        </li>\
                      </div>\
                    </div>';
          $templateCache.put('popoverTemplate.html', popoverTpl);

          var ngInputTextTpl = '<ng-form name="tmpForm"><span class="input-group" ng-class="{\'has-error\': tmpForm.ctrlName.$invalid, \'has-success\': tmpForm.ctrlName.$valid}">\
            <input required class="form-control" type="{{type}}" ng-model="bindModel" name="ctrlName" ng-pattern="pattern" add-validation ng-model-options="modelOptions" \>\
            <span class="input-group-addon" popover-placement="{{popoverPlacement}}" \
            popover-template="\'popoverTemplate.html\'" \
            popover-append-to-body={{popoverAppendToBody}} popover-trigger="mouseenter" \
            ng-mouseenter="initInputValidationPopover(tmpForm.ctrlName)"> \
            <i ng-class="{\'glyphicon glyphicon-info-sign\': tmpForm.ctrlName.$invalid, \'glyphicon glyphicon-ok-sign\': tmpForm.ctrlName.$valid, \'fa fa-spin fa-spinner\': tmpForm.ctrlName.$pending}" />\
            </span></span></ng-form>';

          $templateCache.put('ngInputTextTemplate.html', ngInputTextTpl);

        } ]);
