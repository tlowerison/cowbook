define(["jquery"], function(jquery) {
	return {
		set: function(n, w, h, s1, s2) {
			sprite = s1;
			target = s2;
			name = n;
			width = w;
			height = h;
			ranges['sprite']['left'] = parseInt(sprite.css('left'));
			ranges['sprite']['top'] = parseInt(sprite.css('top'));
			ranges['sprite']['right'] = ranges['sprite']['left'] + parseInt(sprite.width());
			ranges['sprite']['bottom'] = ranges['sprite']['top'] + parseInt(sprite.height());
			if (target !== undefined) {
				newTargetLocation();
				targetOffset = parseInt(sprite.height());
				target.css('left', ranges['target']['left']);
				target.css('top', ranges['target']['top'] - targetOffset);
			}
		},
		keyDown: function(which) {
			if (which < 37 || which > 40) {
				return;
			}

			if (!(((ranges['sprite']['left'] >= 0 && ranges['sprite']['left'] < pixelAdvance) && which === 37)
				|| ((ranges['sprite']['top'] >= 0 && ranges['sprite']['top'] < pixelAdvance) && which === 38)
				|| ((width - ranges['sprite']['right'] >= 0 && width - ranges['sprite']['right'] < pixelAdvance)
					&& which === 39)
				|| ((height - ranges['sprite']['bottom'] >= 0 && height - ranges['sprite']['bottom'] < pixelAdvance)
					&& which === 40))) {
				sprite.css('background-image', 'url("media/' + name
					+ keysDown[which] + walkToggle.toString() + '.png")');
				ranges['sprite']['left'] = (which % 2) * (which - 38) * pixelAdvance + ranges['sprite']['left'];
				ranges['sprite']['top'] = Math.abs(which % 2 - 1) * (which - 39) * pixelAdvance + ranges['sprite']['top'];
				ranges['sprite']['right'] = ranges['sprite']['left'] + parseInt(sprite.width());
				ranges['sprite']['bottom'] = ranges['sprite']['top'] + parseInt(sprite.height());
				sprite.css('left', ranges['sprite']['left'].toString());
				sprite.css('top', ranges['sprite']['top'].toString());
				
				if (count === 5) {
					walkToggle = 1 - walkToggle;
					count = 0;
				} else {
					count += 1;
				}

				if (target != undefined && overlap(ranges['sprite'], ranges['target'])) {
					newTargetLocation();
					target.fadeOut('fast', function() {
						target.css('left', ranges['target']['left']);
						target.css('top', ranges['target']['top'] - targetOffset);
						spriteAlter();
					});
					target.fadeIn('fast');
				}
			}
		}
	};
});

function newTargetLocation() {
	var random1 = (width - parseInt(target.width())) * Math.random();
	var random2 = (height - parseInt(target.height())) * Math.random();
	ranges['target']['left'] = Math.round(random1);
	ranges['target']['right'] = Math.round(random1 + parseInt(target.width()));
	ranges['target']['top'] = Math.round(random2);
	ranges['target']['bottom'] = Math.round(random2 + parseInt(target.height()));
}
function overlap(range1, range2) {
	return ((range1['left'] >= range2['left'] && range1['left'] <= range2['right'])
		|| (range1['right'] >= range2['left'] && range1['right'] <= range2['right']))
		&& ((range1['top'] >= range2['top'] && range1['top'] <= range2['bottom'])
		|| (range1['bottom'] >= range2['top'] && range1['bottom'] <= range2['bottom']));
}
function spriteAlter() {
	sprite.css('width', (sprite.width()) + 10);
	sprite.css('height', (sprite.height()) + 10);
}

var keysDown = {
	37: 'Left',
	38: 'Up',
	39: 'Right',
	40: 'Down'
};
var ranges = {
	'sprite': {},
	'target': {}
};
var pixelAdvance = 5;
var walkToggle = 0;
var count = 0;
var sprite = null;
var target = null;
var name = '';
var width = 0;
var height = 0;
var targetOffset = 0;
