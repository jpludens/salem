// Directives for the Untitled Salem Tools App.

app = angular.module("salemApp");

app.directive("persona", function () {
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

			
			// Handle 'Any'
			if (scope.persona.specificity == 0) {
				elem.text("Any");
				elem.addClass("persona-text--any");
			}
			// Handle exact role names
			else if (scope.persona.specificity == 3) {
				if (scope.persona.team == 'Neutral') {
					// Replace space in 'Serial Killer' with a -
					// Serial Killer is the only 2-word role except
					// Vampire Hunter - which belongs to the town color class.
					var classMod =
						scope.persona.name.toLowerCase().replace(" ", "-")
				}
				else {
					var classMod = scope.persona.team.toLowerCase();
				}

				elem.text(scope.persona.name);
				elem.addClass("persona-text--" + classMod);
			}
			// Handle 'Random $Team' and '$Team $Category'
			else {
				// The more general information is team, so set that at top level
				elem.text(scope.persona.team);
				elem.addClass("persona-text--" + scope.persona.team.toLowerCase())

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