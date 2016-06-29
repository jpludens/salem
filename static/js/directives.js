// Directives for the Untitled Salem Tools App.

app = angular.module("salemApp");

app.directive("role", function () {
	return {
		scope: '@',
		link: function (scope, elem, attrs) {
			if (scope.roleDesc == undefined) {
				return;
			}
			if (scope.roleDesc.specificity == 3) {
				if (scope.roleDesc.team == 'Neutral') {
					var classMod =
						scope.roleDesc.name.toLowerCase().replace(" ", "-")
				}
				else {
					var classMod = scope.roleDesc.team.toLowerCase();
				}
				elem.text(scope.roleDesc.name);
				elem.addClass("role-text--" + classMod);
			}
			else if (scope.roleDesc.specificity == 0) {
				elem.text("Any");
			}
			else {
				var teamSpan = angular.element("<span></span>");
				teamSpan.text(scope.roleDesc.team);
				teamSpan.addClass("role-text--" +
					scope.roleDesc.team.toLowerCase());

				var catSpan = angular.element("<span></span>");
				catSpan.text(scope.roleDesc.category || "Random");
				catSpan.addClass("role-text--category");

				if (scope.roleDesc.specificity == 1) {
					elem.append(catSpan);
					elem.append("&nbsp;");
					elem.append(teamSpan);
				}
				else {
					elem.append(teamSpan);
					elem.append("&nbsp;");
					elem.append(catSpan);
				}
			}
		}
	}
});
