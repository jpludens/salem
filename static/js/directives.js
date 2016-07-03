// Directives for the Untitled Salem Tools App.

app = angular.module("salemApp");

app.directive("role", function () {
	return {
		scope: '@',
		link: function (scope, elem, attrs) {
			if (scope.roleDesc == undefined) {
				return;
			}

			var wikiLinkTemplate = 'http://town-of-salem.wikia.com/wiki/';

			// Handle exact role names
			if (scope.roleDesc.specificity == 3) {
				if (scope.roleDesc.team == 'Neutral') {
					// Generalized handling of transforming sk name to class
					var classMod =
						scope.roleDesc.name.toLowerCase().replace(" ", "-")
				}
				else {
					var classMod = scope.roleDesc.team.toLowerCase();
				}
				var roleSpan = angular.element("<span></span>");
				roleSpan.text(scope.roleDesc.name);
				roleSpan.addClass("role-text--" + classMod);
				elem.append(roleSpan);
				attrs.$set('href', wikiLinkTemplate +
					scope.roleDesc.name.replace(" ", "_"));
			}
			// Handle 'Any'
			else if (scope.roleDesc.specificity == 0) {
				var roleSpan = angular.element("<span></span>");
				roleSpan.addClass("role-text--any");
				roleSpan.text("Any");
				elem.append(roleSpan);
				attrs.$set('href', wikiLinkTemplate + "Roles");
			}
			// Handle 'Random $Team' and '$Team $Category'
			else {
				var teamSpan = angular.element("<span></span>");
				teamSpan.text(scope.roleDesc.team);
				teamSpan.addClass("role-text--" +
					scope.roleDesc.team.toLowerCase());

				var catSpan = angular.element("<span></span>");
				catSpan.text(scope.roleDesc.category || "Random");
				catSpan.addClass("role-text--category");

				// Random $Team
				if (scope.roleDesc.specificity == 1) {
					elem.append(catSpan);
					elem.append("&nbsp;");
					elem.append(teamSpan);
					attrs.$set('href', wikiLinkTemplate + scope.roleDesc.team);
				}
				// $Team $Category
				else {
					elem.append(teamSpan);
					elem.append("&nbsp;");
					elem.append(catSpan);
					attrs.$set('href', wikiLinkTemplate +
						scope.roleDesc.team + "_" + scope.roleDesc.category);
				}
			}
		}
	}
});
