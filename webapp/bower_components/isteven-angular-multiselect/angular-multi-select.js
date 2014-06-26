/* 
 * Angular JS Multi Select
 * Creates a dropdown-like button with checkboxes. 
 *
 * Created: Tue, 14 Jan 2014 - 5:18:02 PM
 *
 * Released under the MIT License
 *
 * --------------------------------------------------------------------------------
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Ignatius Steven (https://github.com/isteven)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal 
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions: 
 *
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE.
 * --------------------------------------------------------------------------------
 */

angular.module( 'multi-select', ['ng'] ).directive( 'multiSelect' , [ '$sce', '$filter', function ( $sce, $filter ) {
    return {
        restrict: 
            'AE',

        replace: 
            true,

        scope: 
        {            
            inputModel      : '=',
            outputModel     : '=',
            buttonLabel     : '@',
            selectionMode   : '@',
            itemLabel       : '@',
            tickProperty    : '@',
            disableProperty : '@',
            orientation     : '@',
            maxLabels       : '@',
            isDisabled      : '=',
            directiveId     : '@',
            helperElements  : '@',
            onOpen          : '&',
            onClose         : '&',
            onBlur          : '&',
            onFocus         : '&',
            callback: '&',
            buttonLabelFn: '&'        
        },

        template: 
            '<span class="multiSelect inlineBlock" >' +
                '<button type="button" class="multiSelect button multiSelectButton" ng-click="toggleCheckboxes( $event ); refreshSelectedItems();" ng-bind-html="varButtonLabel" ng-focus="onFocus()" ng-blur="onBlur()">' +
                '</button>' +                
                '<div class="multiSelect checkboxLayer hide">' +
                    '<div class="multiSelect line">' +
                        '<span ng-if="!isDisabled && ( displayHelper( \'all\' ) || displayHelper( \'none\' ) || displayHelper( \'reset\' ))">Select: &nbsp;</span>' + 
                            '<button type="button" ng-click="select( \'all\' )"    class="multiSelect helperButton" ng-if="!isDisabled && displayHelper( \'all\' )">All</button> ' +
                            '<button type="button" ng-click="select( \'none\' )"   class="multiSelect helperButton" ng-if="!isDisabled && displayHelper( \'none\' )">None</button> ' + 
                            '<button type="button" ng-click="select( \'reset\' )"  class="multiSelect helperButton" ng-if="!isDisabled && displayHelper( \'reset\' )">Reset</button>' +
                    '</div>' +
                    '<div class="multiSelect line" ng-show="displayHelper( \'filter\' )">' + 
                        'Filter: <input class="multiSelect" type="text" ng-model="labelFilter" />' +
                            '&nbsp;<button type="button" class="multiSelect helperButton" ng-click="labelFilter=\'\'">Clear</button>' +
                    '</div>' +
                    '<div ng-repeat="item in (filteredModel = (inputModel | filter:labelFilter ))" ng-class="orientation" class="multiSelect multiSelectItem">' +
                        '<div class="multiSelect acol">' +
                            '<div class="multiSelect" ng-show="item[ tickProperty ]">&#10004;</div>' +
                        '</div>' +
                        '<div class="multiSelect acol">' +
                            '<label class="multiSelect" ng-class="{checkboxSelected:item[ tickProperty ]}">' +
                                '<input class="multiSelect checkbox" type="checkbox" ng-disabled="itemIsDisabled( item )" ng-checked="item[ tickProperty ]" ng-click="syncItems( item, $event )"/>' +
                                '<span class="multiSelect" ng-class="{disabled:itemIsDisabled( item )}" ng-bind-html="writeLabel( item, \'itemLabel\' )"></span>' +
                            '</label>&nbsp;&nbsp;' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</span>',

        link: function ( $scope, element, attrs ) {           
            
            $scope.selectedItems    = [];    
            $scope.backUp           = [];
            $scope.varButtonLabel   = '';   
            $scope.tabIndex         = 0;
            $scope.tabables         = null;
            $scope.currentButton    = null;

            // Show or hide a helper element 
            $scope.displayHelper = function( elementString ) {
                if ( typeof attrs.helperElements === 'undefined' ) {
                    return true;                    
                }
                switch( elementString.toUpperCase() ) {
                    case 'ALL':
                        if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {                            
                            return false;
                        }
                        else {
                            if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'ALL' ) >= 0 ) {
                                return true;
                            }
                        }
                        break;
                    case 'NONE':
                        if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {
                            return false;
                        }
                        else {
                            if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'NONE' ) >= 0 ) {
                                return true;
                            }
                        }
                        break;
                    case 'RESET':
                        if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'RESET' ) >= 0 ) {
                            return true;
                        }
                        break;
                    case 'FILTER':
                        if ( attrs.helperElements && $scope.helperElements.toUpperCase().indexOf( 'FILTER' ) >= 0 ) {
                            return true;
                        }
                        break;                    
                    default:                        
                        break;
                }
            }                

            // Call this function when a checkbox is ticked...
            $scope.syncItems = function( item, e ) {                                                                
                index = $scope.inputModel.indexOf( item );                
                $scope.inputModel[ index ][ $scope.tickProperty ]   = !$scope.inputModel[ index ][ $scope.tickProperty ];
                
                // If it's single selection mode
                if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {
                    $scope.inputModel[ index ][ $scope.tickProperty ] = true;
                    for( i=0; i<$scope.inputModel.length;i++) {
                        if ( i !== index ) {
                            $scope.inputModel[ i ][ $scope.tickProperty ] = false;
                        }
                    }        
                    $scope.toggleCheckboxes( e );
                }
                                
                $scope.refreshSelectedItems();
                e.target.focus();
            }     

            // Refresh the button to display the selected items and push into output model if specified
            $scope.refreshSelectedItems = function() {

                $scope.varButtonLabel   = '';
                $scope.selectedItems    = [];
                ctr                     = 0;
                
                angular.forEach( $scope.inputModel, function( value, key ) {
                    if ( typeof value !== 'undefined' ) {                        
                        if ( value[ $scope.tickProperty ] === true || value[ $scope.tickProperty ] === 'true' ) {
                            $scope.selectedItems.push( value );        
                        }
                    }
                });
                                           
                // Push into output model
                if ( typeof attrs.outputModel !== 'undefined' ) {            
                    $scope.outputModel = angular.copy( $scope.selectedItems );                    
                }         

                if(typeof $scope.callback !== 'undefined')
                    $scope.callback();
                                      

                // Write label...
                /*if ( $scope.selectedItems.length === 0 ) {
                    $scope.varButtonLabel = 'None selected';
                }
                else {                
                    var tempMaxLabels = $scope.selectedItems.length;
                    if ( typeof $scope.maxLabels !== 'undefined' && $scope.maxLabels !== '' && $scope.maxLabels !== "0" ) {
                        tempMaxLabels = $scope.maxLabels;
                    }

                    // If max amount of labels displayed..
                    if ( $scope.selectedItems.length > tempMaxLabels ) {
                        $scope.more = true;
                    }
                    else {
                        $scope.more = false;
                    }                
                
                    angular.forEach( $scope.selectedItems, function( value, key ) {
                        if ( typeof value !== 'undefined' ) {                        
                            if ( ctr < tempMaxLabels ) {                            
                                $scope.varButtonLabel += ( $scope.varButtonLabel.length > 0 ? ', ' : '') + $scope.writeLabel( value, 'buttonLabel' );
                            }
                            ctr++;
                        }
                    });                

                    if ( $scope.more === true ) {
                        $scope.varButtonLabel += ', ... (Total: ' + $scope.selectedItems.length + ')';
                    }
                }*/
                
                //$scope.varButtonLabel = 'Active sensors ('+$scope.selectedItems.length+'/'+ $scope.inputModel.length+')';
                if(typeof $scope.buttonLabelFn !== 'undefined')
                    $scope.varButtonLabel = $scope.buttonLabelFn();
                else
                    $scope.varButtonLabel = $scope.buttonLabel;

                $scope.varButtonLabel = $sce.trustAsHtml( $scope.varButtonLabel + '<span class="multiSelect caret"></span>' );
            }

            // Check if a checkbox is disabled or enabled. It will check the granular control (disableProperty) and global control (isDisabled)
            // Take note that the granular control has higher priority.
            $scope.itemIsDisabled = function( item ) {
                
                if ( item[ $scope.disableProperty ] === true ) {                    
                    return true;
                }
                else {                    
                    if ( $scope.isDisabled === true ) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                
            }

            // A simple function to parse the item label settings
            $scope.writeLabel = function( item, type ) {
                var label = '';
                var temp = $scope[ type ].split( ' ' );                    
                angular.forEach( temp, function( value2, key2 ) {
                    if ( typeof value2 !== 'undefined' ) {                        
                        angular.forEach( item, function( value1, key1 ) {                    
                            if ( key1 == value2 ) {
                                label += ' ' + value1;        
                            }
                        });                    
                    }
                });
                return $sce.trustAsHtml( label );
            }

            // UI operations to show/hide checkboxes based on click event..
            $scope.toggleCheckboxes = function( e ) {                                                

                if ( e.target ) {                    
                    if ( e.target.tagName.toUpperCase() !== 'BUTTON' && e.target.className.indexOf( 'multiSelectButton' ) < 0 ) {
                        if ( attrs.selectionMode && $scope.selectionMode.toUpperCase() === 'SINGLE' ) {
                            if ( e.target.tagName.toUpperCase() === 'INPUT' )
                            {
                                e = $scope.findUpTag( e.target, 'div', 'checkboxLayer' );
                                e = e.previousSibling;    
                            }
                        }
                        else {
                            e = $scope.findUpTag( e.target, 'button', 'multiSelectButton' );
                        }
                    }
                    else {
                        e = e.target;
                    }
                }                    

                $scope.labelFilter = '';                
              
                // We search them based on the class names
                var multiSelectIndex    = -1;                                
                var checkboxes          = document.querySelectorAll( '.checkboxLayer' );
                var multiSelectButtons  = document.querySelectorAll( '.multiSelectButton' );   

                for( i=0; i < multiSelectButtons.length; i++ ) {
                    if ( e === multiSelectButtons[ i ] ) {                        
                        multiSelectIndex = i;
                        break;
                    }
                }                
                                 
                if ( multiSelectIndex > -1 ) {
                    for( i=0; i < checkboxes.length; i++ ) {
                        if ( i != multiSelectIndex ) {
                            checkboxes[i].className = 'multiSelect checkboxLayer hide';
                        }
                    }                    

                    if ( checkboxes[ multiSelectIndex ].className == 'multiSelect checkboxLayer hide' ) {                    
                        $scope.currentButton = multiSelectButtons[ multiSelectIndex ];
                        checkboxes[ multiSelectIndex ].className = 'multiSelect checkboxLayer show';
                        // https://github.com/isteven/angular-multi-select/pull/5 - On open callback
                        $scope.onOpen();                        
                    }
                    else if ( checkboxes[ multiSelectIndex ].className == 'multiSelect checkboxLayer show' ) {                                    
                        checkboxes[ multiSelectIndex ].className = 'multiSelect checkboxLayer hide';
                        // https://github.com/isteven/angular-multi-select/pull/5 - On close callback
                        $scope.onClose();                        
                    }
                }
            }

            // Traverse up to find the button tag
            // http://stackoverflow.com/questions/7332179/how-to-recursively-search-all-parentnodes
            $scope.findUpTag = function ( el, tag, className ) {

                while ( el.parentNode ) {
                    el = el.parentNode;      
                    if ( typeof el.tagName !== 'undefined' ) {
                        if ( el.tagName.toUpperCase() === tag.toUpperCase() && el.className.indexOf( className ) > -1 ) {
                            return el;
                        }
                    }
                }
                return null;
            }

            // Select All / None / Reset
            $scope.select = function( type ) {
                var temp = [];
                switch( type.toUpperCase() ) {
                    case 'ALL':
                        angular.forEach( $scope.inputModel, function( value, key ) {
                            if ( typeof value !== 'undefined' && value[ $scope.disableProperty ] !== true ) {                        
                                value[ $scope.tickProperty ] = true;
                            }
                        });                                        
                        break;
                    case 'NONE':
                        angular.forEach( $scope.inputModel, function( value, key ) {
                            if ( typeof value !== 'undefined' && value[ $scope.disableProperty ] !== true ) {                        
                                value[ $scope.tickProperty ] = false;
                            }
                        });                
                        break;      
                    case 'RESET':     
                        $scope.inputModel = angular.copy( $scope.backUp );
                        break;
                    default:                        
                }
                $scope.refreshSelectedItems();
            }            


            // Generic validation for required attributes
            // Might give false positives so just ignore if everything's alright.
            validate = function() {
                if ( !( 'inputModel' in attrs )) {
                    console.log( 'Multi-select error: input-model is not defined! (ID: ' + $scope.directiveId + ')' );
                }

                if ( !( 'buttonLabel' in attrs )) {
                    console.log( 'Multi-select error: button-label is not defined! (ID: ' + $scope.directiveId + ')' );                
                }            

                if ( !( 'itemLabel' in attrs )) {
                    console.log( 'Multi-select error: item-label is not defined! (ID: ' + $scope.directiveId + ')' );                
                }                            

                if ( !( 'tickProperty' in attrs )) {
                    console.log( 'Multi-select error: tick-property is not defined! (ID: ' + $scope.directiveId + ')' );                
                }            
            }

            // Validate whether the properties specified in the directive attributes are present in the input model
            validateProperties = function( arrProperties, arrObject ) {
                var notThere = false;            
                var missingProperty = '';
                angular.forEach( arrProperties, function( value1, key1 ) {
                    if ( typeof value1 !== 'undefined' ) {                        
                        var keepGoing = true;
                        angular.forEach( arrObject, function( value2, key2 ) {
                            if ( typeof value2 !== 'undefined' && keepGoing ) {                        
                                if (!( value1 in value2 )) {
                                    notThere = true;
                                    keepGoing = false;
                                    missingLabel = value1;
                                }
                            }
                        });                    
                    }
                });    
                if ( notThere === true ) {
                    console.log( 'Multi-select error: property "' + missingLabel + '" is not available in the input model. (Name: ' + $scope.directiveId + ')' );
                }                
            }            

            ///////////////////////
            // Logic starts here
            ///////////////////////               

            validate();
            $scope.refreshSelectedItems();   
            
            // Watch for changes in input model (allow dynamic input)
            $scope.$watch( 'inputModel' , function( oldVal, newVal ) {                 
                if ( $scope.inputModel !== 'undefined' ) {
                    validateProperties( $scope.itemLabel.split( ' ' ), $scope.inputModel );
                    validateProperties( new Array( $scope.tickProperty ), $scope.inputModel );
                }
                $scope.backUp = angular.copy( $scope.inputModel );                                                    
                $scope.refreshSelectedItems();                                                 
            },true);

            // Watch for changes in directive state (disabled or enabled)
            $scope.$watch( 'isDisabled' , function( newVal ) {         
                $scope.isDisabled = newVal;                               
            });

            // Monitor for clicks outside the button element to hide the checkboxes
            angular.element( document ).bind( 'click' , function( e ) {                                
                var checkboxes = document.querySelectorAll( '.checkboxLayer' );     
                if ( e.target.className.indexOf( 'multiSelect' ) === -1 ) {
                    for( i=0; i < checkboxes.length; i++ ) {                                        
                        checkboxes[i].className = 'multiSelect checkboxLayer hide';                        
                    }
                    e.stopPropagation();
                }                                
            });             
                    
            // For IE8, perhaps. Not sure if this is really executed.
            if ( !Array.prototype.indexOf ) {
                Array.prototype.indexOf = function(what, i) {                    
                    i = i || 0;
                    var L = this.length;
                    while (i < L) {
                        if(this[i] === what) return i;
                        ++i;
                    }
                    return -1;
                };
            }
        }   
    }
}]);

