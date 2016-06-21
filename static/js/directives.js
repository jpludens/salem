// Directives for the Untitled Salem Tools App.

app = angular.module("salemApp");

app.directive("role", function () {
	return {
		scope: '@',
		link: function (scope, elem, attrs) {
			elem.text(scope.role.name);
			elem.addClass(scope.role.textColor);
		}
	}
});

app.directive("alignment", function () {
	return {
		scope: '@',
		link: function (scope, elem, attrs) {
			var team = scope.alignment.team;
			var teamSpan = angular.element("<span></span");
			teamSpan.text(team);
			teamSpan.addClass('textColor' + team);

			if (team == 'Any') {
				elem.append(teamSpan)
			}
			else {
				var category = scope.alignment.category;
				var catSpan = angular.element("<span></span");
				catSpan.text(category);
				catSpan.addClass('textColorCategory');

				spaceSpan = angular.element("<span>&nbsp</span>");

				if (category == 'Random') {
					elem.append(catSpan);
					elem.append(spaceSpan);
					elem.append(teamSpan);
				}
				else {
					elem.append(teamSpan);
					elem.append(spaceSpan);
					elem.append(catSpan);					
				}
			}
		}
	}
});

