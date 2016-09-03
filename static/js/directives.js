// Directives for the Untitled Salem Tools App.
/* Directives:
	gameEvent
	jplToggle
	jplFocus
	modalBlock */

app = angular.module("salemApp");

app.directive('gameEvent', function() {
	/* Element directive built around a GameEvent object, with a summary()
	method and possibly a details() method. Includes an expand/hide feature if
	the details method is defined and its return is non-empty.*/
	return {
		restrict: 'E',
		replace: true,
		link: function(scope, elem, attrs) {
			scope.hasDetails = (typeof scope.event.details !== 'undefined' &&
				scope.event.details().length);
			scope.showDetails = false;
			scope.toggleDetails = function () {
				scope.showDetails = !scope.showDetails;
			}
			scope.chevronDir = function() {
				return scope.showDetails ?
					'fa fa-chevron-down' :
					'fa fa-chevron-right';
			}
		},
		template:
			"<div>" +
				"<span ng-if='!hasDetails' class='fa fa-minus'></span>" +
				"<span ng-if='hasDetails' ng-click='toggleDetails()'" +
					"ng-class=chevronDir()>" +
				"</span>" +
				"<span class='event-string' ng-bind-html='event.summary()|salemifyText'></span>" +
				"<ul name='event-details' ng-show='showDetails'>" +
					"<li name='event-detail-item' ng-repeat='detail in event.details()'" +
						"<p ng-bind-html='detail|salemifyText'></p>" +
					"</li>" +
				"</ul>"+
			"</div>"
	}
});

app.directive('jplToggle', function() {
	/* Directive that manages multiple attributes which map to a binary state:
	The property describing the state, element text, and css classes.
	Also supports triggering a function call on toggle. */
	// Does not play nicely with:
	// ng-click: Use toggle-action to achieve a similar effect.
	//           toggle-action is guaranteed to execute AFTER
	//           the state and text are updated.
	// ng-if: Use ng-show to ensure that the toggle-state is
	//        correctly set and accessible by other elements.
	return {
		priority: 1,
		link: function (scope, elem, attrs) {
			var state = false;
			var toggleStateName = attrs['toggleState'];
			var toggleAction = attrs['toggleAction'];
			var onText = attrs['onText'] || "";
			var offText = attrs['offText'] || "";

			var turnOn = function() {
				state = true;
				elem.text(onText);
				if (toggleStateName) {
					scope[toggleStateName] = true;
				}
			}

			var turnOff = function() {
				state = false;
				elem.text(offText);
				if (toggleStateName) {
					scope[toggleStateName] = false;
				}
			}

			// Create toggle property on scope, if requested.
			if (toggleStateName) {
				scope[toggleStateName] = state;
			}

			// Set initial state.
			attrs['startOn'] ? turnOn() : turnOff();

			// Bind toggle. After turning off or on,
			// execute toggle action, if requested.
			elem.bind('click', function($event) {
				scope.$apply(function () {
					state ? turnOff() : turnOn();
				});
				if (toggleAction) {
					scope.$apply( function() {
						scope.$eval(toggleAction);
					});
				}
			});
		}
	}
});

app.directive('jplFocus', function($timeout) {
	/* Directive applicable to an element. That element will receive focused
	when the specified property matches the specified value. */
	return {
		link: function (scope, elem, attrs) {
			var prop = attrs['focusWatchProperty'];
			var val = attrs['focusWhenValueIs'] || "true";

			if (attrs['focusSelect']) {
				var focusFn = function () {
					elem[0].focus()
					elem[0].select();
				}
			}
			else {
				var focusFn = function () {
					elem[0].focus();
				}
			}

			scope.$watch(
				function () {
					return scope.$eval(prop);
				},
				function(newValue) {
					if (newValue == scope.$eval(val)) {
						$timeout(focusFn);
					}
				}
			);
		}
	}
});

// Googling for assistance with this led me here:
// http://adamalbrecht.com/2013/12/12/creating-a-simple-modal-dialog-directive-in-angular-js/
// modalDialog changed to modalBlock
// template spaced out
// removed closing tag (leaving responsibility for dismissal to controller)
app.directive('modalBlock', function() {
	/* Directive element that appears as a modal box on top of the viewport.
	Clicking outside the modal hides it, but this can be disabled. */
	return {
		restrict: 'E',
		scope: {
			show: '='
		},
		replace: true, // Replace with the template below
		transclude: true, // we want to insert custom content inside the directive
		link: function(scope, element, attrs) {
			scope.dialogStyle = {};
				if (attrs.width)
					scope.dialogStyle.width = attrs.width;
				if (attrs.height)
					scope.dialogStyle.height = attrs.height;
				scope.hideModal = function() {
					if (!attrs.noHide) {
						scope.show = false;
					}
				};
			},
		template:
			"<div class='ng-modal' ng-show='show'>" +
				"<div class='ng-modal-overlay' ng-click='hideModal()'></div>" +
					"<div class='ng-modal-dialog' ng-style='dialogStyle'>" +
						"<div class='ng-modal-dialog-content' ng-transclude></div>" +
					"</div>" + 
			"</div>"
		};
});
