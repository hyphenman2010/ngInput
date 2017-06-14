'use strict';

var commonMod = angular.module('ngInput.common', []);

commonMod.factory('ngInputLocalize', [ '$http', '$rootScope', function($http, $rootScope) {
  var localize = {
      
    forDev: false,
    localDataEN: {
      "min" : "Input value too small",
      "max" : "Input value too big",
      "pattern" : "Input format is incorrect",
      "email" : "Invalid email format",
      "required" : "Required",
      "valid" : "Valid input",
      "compareTo" : "Not same as New Password",
      "pwStrength" : "Password strenght smaller than 50",
      "remainingQty" : "Remaining quantity too small",
      "duplicated" : "Cannot be duplicated"
    },
    
    localDataZH: {
      "min" : "��J�ƭȤӤp",
      "max" : "��J�ƭȤӤj",
      "pattern" : "��J�榡�����T",
      "email" : "�q�l�榡�����T",
      "required" : "���ݶ�g",
      "valid" : "��J���T",
      "compareTo" : "�M�s�K�X���ۦP",
      "pwStrength" : "�s�K�X�j�פ���50",
      "remainingQty" : "�ƶq�l�ȤӤ�",
      "duplicated" : "���୫��"
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
        
        if (lang.langCode === 'en') {
          localize.currentLocaleData = localize.localDataEN;
        } else
          localize.currentLocaleData = localize.localDataZH;
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






mod.directive('ngInputNumber', ['$q', '$timeout', 'ngInputLocalize', function($q, $timeout, localize) {
  return {
    restrict: 'E',
    scope : {
      bindModel: "=",
      min: "=?",
      max: "=?",
      step: "=?",
      pattern: "=?",
      validators: "=?",
      asyncValidators: "=?",
      callBack: "&?"
    },
    templateUrl: 'ngInputNumberTemplate.html',
    
    controller: function($scope) {
      
      $scope.modelOptions =  angular.isDefined($scope.asyncValidators) ? { 'updateOn': 'default blur', 'debounce': {'default':400, 'blur': 0} } : { 'updateOn': 'default blur', 'debounce': {'default':0, 'blur': 0} };
      $scope.min = angular.isDefined($scope.min) ? $scope.min : 1;
      $scope.max = angular.isDefined($scope.max) ? $scope.max : 100000000000;
      $scope.step = angular.isDefined($scope.step) ? $scope.step : 1;
      $scope.pattern = angular.isDefined($scope.pattern) ? $scope.pattern : "^\\d+(?:\\.\\d{1,2})?$";
    
    
    },            
    link: function(scope) {
      
      scope.inputValidationPopover = {
          control: {}
      };
      
      scope.initInputValidationPopover = function(control) {
        scope.inputValidationPopover.control = control;
      }
      
      scope.getLocalizedText = function(key){
        return localize.localizeText(key);
      }
    
    }
  };
}]);


mod.directive('ngInputSelect', ['$q', '$timeout', 'ngInputLocalize', function($q, $timeout, localize) {
  return {
    restrict: 'E',
    scope : {
      bindModel: "=",
      optionList: "=",
      groupBy: '@?',
      orderBy: '@?',
      validators: "=?",
      asyncValidators: "=?",
      showValue: "@?",
      callBack: "&?"
    },
    templateUrl: 'ngInputSelectTemplate.html',
    
    controller: function($scope) {
      
      $scope.orderBy =  angular.isDefined($scope.orderBy) ? $scope.orderBy : "'value'";
      $scope.showValue =  angular.isDefined($scope.showValue) ? $scope.showValue : 'true';
      
      
      $scope.options = "i.value as padValueName(i.value, i.name) for i in optionList | orderBy:" + $scope.orderBy;
      if (angular.isDefined($scope.groupBy)) {
        $scope.options = "i.value as padValueName(i.value, i.name) group by i." + $scope.groupBy +" for i in optionList | orderBy:" + $scope.orderBy;
      }
      
       
      
      $scope.padValueName = function(value, name) {
        
        if ($scope.showValue === 'true') {
          var spaces = " ";
          for (var i = value.length; i < 7; i++)
            spaces += String.fromCharCode(160);
          
          return value + spaces + name;
        } else {
          return name;
        }
      }
    
    },
    link: function(scope) {
      
      scope.inputValidationPopover = {
          control: {}
      };
      
      scope.initInputValidationPopover = function(control) {
        scope.inputValidationPopover.control = control;
      }
      
      scope.getLocalizedText = function(key){
        return localize.localizeText(key);
      }
    
    }
  };
}]);




mod.directive('ngInputDate', ['$q', '$timeout', 'ngInputLocalize', function($q, $timeout, localize) {
  return {
    restrict: 'E',
    
    scope : {
      bindModel: "=",
      validators: "=?",
      asyncValidators: "=?"
    },
    templateUrl: 'ngInputDateTemplate.html',
    controller: function($scope) {
      
    },  
    link: function(scope, elm, attrs, ctrl) {
      
      
      scope.inputValidationPopover = {
          control: {}
      };
      
      scope.initInputValidationPopover = function(control) {
        scope.inputValidationPopover.control = control;
      }
      
      scope.getLocalizedText = function(key){
        return localize.localizeText(key);
      }
    
    }
  };
}]);      




















mod
    .run([
        'ngInputLocalize',
        '$templateCache',

        function(ngInputLocalize, $templateCache) {
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
          $templateCache.put('ngInputPopoverTemplate.html', popoverTpl);

          
          //text, email
          var ngInputTextTpl = '<ng-form name="tmpForm"><span class="input-group" ng-class="{\'has-error\': tmpForm.ctrlName.$invalid, \'has-success\': tmpForm.ctrlName.$valid}">\
            <input required class="form-control" type="{{type}}" ng-model="bindModel" name="ctrlName" ng-pattern="pattern" add-validation ng-model-options="modelOptions" ></input>\
            <span class="input-group-addon" popover-placement="{{popoverPlacement}}" \
            popover-template="\'ngInputPopoverTemplate.html\'" \
            popover-append-to-body={{popoverAppendToBody}} popover-trigger="mouseenter" \
            ng-mouseenter="initInputValidationPopover(tmpForm.ctrlName)"> \
            <i ng-class="{\'glyphicon glyphicon-info-sign\': tmpForm.ctrlName.$invalid, \'glyphicon glyphicon-ok-sign\': tmpForm.ctrlName.$valid, \'fa fa-spin fa-spinner\': tmpForm.ctrlName.$pending}" ></i>\
            </span></span></ng-form>';

          $templateCache.put('ngInputTextTemplate.html', ngInputTextTpl);
          
          
          
          //number
          var ngInputNumberTpl = '<ng-form name="tmpForm"><span class="input-group" ng-class="{\'has-error\': tmpForm.ctrlName.$invalid, \'has-success\': tmpForm.ctrlName.$valid}">\
          <input required class="form-control" type="number" ng-model="bindModel" name="ctrlName" min={{min}} max={{max}} step={{step}} ng-pattern="pattern" add-validation ng-model-options="modelOptions" ng-change="callBack()" />\
          <span class="input-group-addon" popover-placement="right" \
          popover-template="\'ngInputPopoverTemplate.html\'" \
          popover-append-to-body="true" popover-trigger="mouseenter" \
          ng-mouseenter="initInputValidationPopover(tmpForm.ctrlName)">\
          <i ng-class="{\'glyphicon glyphicon-info-sign\': tmpForm.ctrlName.$invalid, \'glyphicon glyphicon-ok-sign\': tmpForm.ctrlName.$valid, \'fa fa-spin fa-spinner\': tmpForm.ctrlName.$pending}" ></i>\
          </span></span></ng-form>';
          
          
          $templateCache.put('ngInputNumberTemplate.html', ngInputNumberTpl);
          
          
          
          
          //option select
          var ngInputSelectTpl = '<ng-form name="tmpForm"><span class="input-group" ng-class="{\'has-error\': tmpForm.ctrlName.$invalid, \'has-success\': tmpForm.ctrlName.$valid}">\
          <select  required class="form-control" ng-model="bindModel" name="ctrlName" \
          ng-options="{{options}}" add-validation ng-change="callBack()" ></select>\
          <span class="input-group-addon" popover-placement="right" \
          popover-template="\'ngInputPopoverTemplate.html\'" \
          popover-append-to-body="true" popover-trigger="mouseenter" \
          ng-mouseenter="initInputValidationPopover(tmpForm.ctrlName)">\
          <i ng-class="{\'glyphicon glyphicon-info-sign\': tmpForm.ctrlName.$invalid, \'glyphicon glyphicon-ok-sign\': tmpForm.ctrlName.$valid, \'fa fa-spin fa-spinner\': tmpForm.ctrlName.$pending}"></i>\
          </span></span></ng-form>';
          
          
          $templateCache.put('ngInputSelectTemplate.html', ngInputSelectTpl);
          
          
          
          //Date
          var ngInputDateTpl = '<ng-form name="tmpForm"><span class="input-group"\
                  ng-class="{\'has-error\': tmpForm.ctrlName.$invalid, \'has-success\': tmpForm.ctrlName.$valid }">\
                  <input type="text" class="form-control" datepicker-popup="yyyy-MMM-dd"\
                    ng-model="bindModel" is-open="holidayDateIsOpen"\
                    disabled="true" placeholder="yyyy-MMM-dd" name="ctrlName"\
                    add-validation required ></input>\
                  <span class="input-group-btn">\
                    <button type="button" class="btn btn-default"\
                      ng-click=" $event.stopPropagation(); holidayDateIsOpen=true;">\
                      <i class="glyphicon glyphicon-calendar"></i>\
                    </button>\
                    <button class="btn" popover-placement="right"\
                    popover-template="\'ngInputPopoverTemplate.html\'"\
                    popover-append-to-body="true" popover-trigger="mouseenter"\
                    ng-mouseenter="initInputValidationPopover(tmpForm.ctrlName)"\
                    ng-class="{\'btn-danger\': tmpForm.ctrlName.$invalid, \'btn-success\': tmpForm.ctrlName.$valid}">\
                    <i ng-class="{\'glyphicon glyphicon-info-sign\':tmpForm.ctrlName.$invalid, \'glyphicon glyphicon-ok-sign\':tmpForm.ctrlName.$valid, \'fa fa-spin fa-spinner\': tmpForm.ctrlName.$pending}" ></i>\
                    </button>\
                    </span></span></ng-form>';
          
          
          $templateCache.put('ngInputDateTemplate.html', ngInputDateTpl);
          
          
          
          
          
          

        } ]);
