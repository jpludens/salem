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
				else if (persona.specificity == 1) {
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
			console.log(attrs);

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
