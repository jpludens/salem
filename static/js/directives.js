// Directives for the Untitled Salem Tools App.

app = angular.module("salemApp");

app.directive("persona", function (salemTextColorFactory) {
	return {
		scope: '@',
		link: function (scope, elem, attrs) {

			var getWikiUrl = function (persona) {
				if (persona == null) {
					return;
				}

				var wikiLinkTemplate = 'http://town-of-salem.wikia.com/wiki/';

				if (persona.specificity == 0) {
					return wikiLinkTemplate + "Roles";
				}
				else if (persona.specificity == 1) {
					return wikiLinkTemplate + persona.team;
				}
				else if (persona.specificity == 2) {
					return wikiLinkTemplate + persona.team + "_" +
						persona.category;
				}
				else if (persona.specificity == 3) {
					return wikiLinkTemplate + persona.name.replace(" ", "_")
				}
				return;
			}

			if (scope.persona == undefined) {
				return;
			}

			elem.addClass(salemTextColorFactory(scope.persona));
			
			// Handle 'Any'
			if (scope.persona.specificity == 0) {
				elem.text("Any");
			}
			// Handle exact role names
			else if (scope.persona.specificity == 3) {
				elem.text(scope.persona.name);
			}
			// Handle 'Random $Team' and '$Team $Category'
			else {
				// The more general information is team, so set that at top level
				elem.text(scope.persona.team);

				var catSpan = angular.element("<span></span>");
				catSpan.text(scope.persona.category || "Random");
				catSpan.addClass("persona-text--category");

				// Random $Team
				if (scope.persona.specificity == 1) {
					elem.prepend("&nbsp;")
					elem.prepend(catSpan);
				}
				// $Team $Category
				else {
					elem.append("&nbsp;");
					elem.append(catSpan);
				}
			}

			if (attrs["linkToWiki"]) {
				// Create an anchor tag linking to the appropriate wiki page
				var anchor = angular.element("<a></a>")
				var href = getWikiUrl(scope.persona);
				anchor.attr('href', href);
				anchor.attr('target', "_blank")
				// Wrap the persona element in the anchor tag
				elem.after(anchor);
				elem.detach();
				anchor.append(elem);
			}
		}
	}
});

app.directive('jplToggle', function() {
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
				scope.show = false;
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