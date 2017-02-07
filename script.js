requirejs.config({
	paths: {
		jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min',
		ElementQueries: 'node_modules/css-element-queries/src/ElementQueries',
		ResizeSensor: 'node_modules/css-element-queries/src/ResizeSensor'
	}
});

require(['jquery', 'ElementQueries', 'ResizeSensor'], function(jquery, ElementQueries, ResizeSensor) {
	$(document).ready(function() {

		/* Detects when window changes width and updates all elements. */
		ElementQueries.listen();
		new ResizeSensor($('html'), function() {
			windowWidth = $('html').width();
			windowHeight = $('html').height();
			updateCss();
		});

		/*
			Sets all margin functions for varying amounts
			of items in row.
		*/
		function margins(n) {
			return function(itemWidth) {
				return (windowWidth - n * itemWidth) / (2 * n);
			};
		};
		for (i = 1; i <= maxItemsPerRow; i += 1) {
			margin[i] = margins(i);
		}

		/* Creates all page trees. */
		for (var accessKey in pageData) {
			pages[accessKey] = new tree(
				pageData[accessKey][0],
				accessKey,
				pageData[accessKey][1],
				pageData[accessKey][3],
				'media/' + accessKey + 'Thumb.jpg',
				'media/' + accessKey + 'Back.jpg',
				pageData[accessKey][2],
				style(pageData[accessKey][2], pageData[accessKey][3].length)
			);
		}

		updateCss();

		loadPage('home');
	});

	function loadPage(name) {
		clearPage();

		/* Change header text and page background. */
		$('#nav').html(pages[name].label);
		$('title').html(pages[name].label);
		$('body').css('background-image', 'url("' + pages[name].background + '")');

		if (!(name == 'home' || $('#back-button').length)) {
			$('<div id="back-button"></div>').prependTo('#nav');
			$('#back-button').on('click', function() {
				$('body').fadeOut('fast', function() {
					$('#back-button').remove();
					stack.pop();
					loadPage(stack[stack.length - 1]);
				});
			});
		}

		/* Add pages children to page container for display. */
		for (var i = 0; i < pages[name].children.length; i += 1) {
			if (pages[name].type === 'display') {
				addElement(pages[pages[name].children[i]]);
			} else if (pages[name].type === 'media-display') {
				addMedia(pages[pages[name].children[i]]);
			}
		}

		updateCss();

		$('body').fadeIn('fast');
	}

	/* Adds an element to display consisting of a thumbnail and a label. */
	function addElement(tree) {
		$('<div class="element" id="' + tree.accessKey + 'e"><div class="thumb" id="' + tree.accessKey
			+ '"></div><h5 id="' + tree.accessKey + 'h">' + tree.label
			+ '</h5></div>').appendTo('#container');
		addRule(tree.accessKey, '#',
			'{background-image: url("' + tree.thumbnail + '")}');
		$('#' + tree.accessKey + ', #' + tree.accessKey + 'h').on('click', function() {
			$('body').fadeOut('fast', function() {
				stack.push(tree.accessKey);
				loadPage(tree.accessKey);
			});
		});
	}

	/* Adds a media to display on page. */
	function addMedia(tree) {
		if (tree.type === 'video-embed') {

			$('<div class="mediaContainer"><iframe class="media" src="' + tree.children[0]
				+ '" frameborder="0" allowfullscreen></iframe><h5 id="' + tree.accessKey
				+ 'h">' + tree.label + '</h5></div>').appendTo('#container');

		} else if (tree.type === 'video') {

			$('<div class="mediaContainer"><video class="media" preload="auto" controls><source type="video/'
				+ tree.children[1] + '" src="' + tree.children[0] + '"></video><h5 id="' + tree.accessKey
				+ 'h">' + tree.label + '</h5></div>').appendTo('#container');

		} else if (tree.type === 'image-embed' || tree.type === 'image') {

			$('<div class="mediaContainer"><div class="media" id="' + tree.accessKey
				+ '"></div><h5 id="' + tree.accessKey + 'h">' + tree.label
				+ '</h5></div>').appendTo('#container');

			addRule(tree.accessKey, '#',
				'{background-image: url("' + tree.thumbnail + '")}');

		} else if (tree.type === 'interactive') {

			$('<div class="mediaContainer"><div class="media" id="' + tree.accessKey
				+ 'm"></div><h5 id="' + tree.accessKey + 'h">' + tree.label
				+ '</h5></div>').appendTo('#container');

			$('<div class="sprite" id="' + tree.accessKey + '"></div>').appendTo('#' + tree.accessKey + 'm');
			if (tree.children[0]) {
				$('<div class="sprite" id="' + tree.accessKey + 'Target"></div>').appendTo('#' + tree.accessKey + 'm');
			}

			addRule(tree.accessKey + 'm', '#',
				'{background-color: #eeeeee}');

			/* Sprite images must support transparency and thus be .png files. */
			$('#' + tree.accessKey).css('background-image', 'url("media/' + tree.accessKey + '.png")');
			$('#' + tree.accessKey).css('left', $('#' + tree.accessKey + 'm').width() / 200 * windowWidth);
			$('#' + tree.accessKey).css('top', $('#' + tree.accessKey + 'm').height() / 200 * windowHeight);


			$('#' + tree.accessKey + 'Target').css('background-image', 'url("media/' + tree.accessKey + 'Target.png")');

			require(["interactive"], function(interactive) {
				interactive.set(tree.accessKey, $('#' + tree.accessKey + 'm').width(),
					$('#' + tree.accessKey + 'm').height(), $('#' + tree.accessKey), $('#' + tree.accessKey + 'Target'));
			});

			$(document).on('keydown', function(event) {
				require(["interactive"], function(interactive) {
						interactive.keyDown(event.which);
				});
			});

		}
	}

	/* Adds a style to the css file. */
	function addRule(name, flair, values) {
		$('<style type="text/css">' + flair + name + values + '</style>').appendTo('head');
		rules.push(flair + name);
	}

	/* Make all CSS edits in styleEdits to elements now on page. */
	function updateCss(name=stack[stack.length - 1]) {
		var thisStyle = pages[name].style(windowWidth);
		for (var elem in thisStyle) {
			for (var attr in thisStyle[elem]) {
				$(elem).css(attr, thisStyle[elem][attr]);
			}
		}
	}

	/* Clears all rules and elements from page. */
	function clearPage() {
		$('.thumb').remove();
		$('.element').remove();
		$('.media').remove();
		$('.mediaContainer').remove();

		if (rules != undefined) {
			while (rules.length > 0) {
				$(rules[0]).remove();
				rules.shift(0, 1);
			}
		}
	}

	var windowWidth = $('html').width();
	var windowHeight = $('html').height();
});

/*
	Each tree contains info on:
	label, accessKey, parent tree,
	all of it's children trees,
	it's thumbnail media, it's background media,
	the type of media being displayed on its page,
	and any and all style edits necessary for its page.
*/
function tree(label, accessKey, parent, children, thumbnail, background, type, style) {
	this.label = label;
	this.accessKey = accessKey;
	this.parent = parent;
	this.children = children;
	this.thumbnail = thumbnail;
	this.background = background;
	this.type = type;
	this.style = style;
};

/* Default page style edits. */
var style = function(type, items) {
	if (items === 0) {
		return function(dim) {
			return null;
		};
	}
	if (type === 'display') {
		return function(dimension) {
			return {
				'.element': {
					'margin-left': margin[Math.min(items, maxItemsPerRow)](thumbDim(dimension)) + 'px',
					'margin-right': margin[Math.min(items, maxItemsPerRow)](thumbDim(dimension)) + 'px'
				}
			};
		};
	} else {
		return function(dimension) {
			return {
				'.media': {
					'margin-left': margin[1](dimension / 2) + 'px',
					'margin-right': margin[1](dimension / 2) + 'px'
				}
			};
		};
	}
};

/* Object containing all page trees. */
var pages = {};

/* Array containing current page browsing stack. */
var stack = ['home'];

/* Contains all current page rules. */
var rules = [];

var margin = {
	0: function() {
		return 0;
	}
};

var thumbDim = function(ww) {
	return Math.floor(ww / 7) - 2;
};

var maxItemsPerRow = 4;

/*
	Data on site tree and each page's info.
	First page must have accessKey 'home'.
	Media pages have their media as its children
	and are named mediaThumb. Embed medias 
	have their source link as the first
	and only element in their children. Local images
	and videos are referred to by 'mediaxxxThumb.jpg' etc.
	Local videos have the second child as the file type.
	Interactive's children[0] is whether it has a target
	sprite in the interactive,
	with source format 'accessKeyTarget.png'.
*/
var pageData = {
	'home': [
		'Cowbook', 'home',
		'display',
		[
			'people'
		]
	],
	'people': [
		'Cows', 'home',
		'display',
		[
			'cow1',
			'cow2',
			'cow3'
		]
	],
	'cow1': [
		'Cow 1', 'people',
		'media-display',
		[
			'bull'
		]
	],
	'cow2': [
		'Cow 2', 'people',
		'media-display',
		[
			'cowBell'
		]
	],
	'cow3': [
		'Cow 3', 'people',
		'media-display',
		[
			'moveCow'
		]
	],
	'bull': [
		'Dis Bull Tho', 'cow1',
		'image',
		[]
	],
	'cowBell': [
		'Real Cow Bell HD', 'cow2',
		'video-embed',
		[
			'https://www.youtube.com/embed/EM2O8RPZcuk'
		]
	],
	'moveCow': [
		'Move That Cow!', 'cow3',
		'interactive', [true]
	]
};
