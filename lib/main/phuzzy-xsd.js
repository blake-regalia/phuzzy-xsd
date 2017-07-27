/* eslint-env browser */

const $ = require('jquery-browserify');
const phuzzy = require('../../../../lib/main/phuzzy.js');


// prefixes used by this plugin
const H_PREFIXES = {
	xsd: 'http://www.w3.org/2001/XMLSchema#',
};

// get handy function to expand terse term strings
const tts = phuzzy.tts(H_PREFIXES);

module.exports = function(h_settings) {
	// set locale
	let s_locale = h_settings.locale || 'en-US';

	// test locale
	try {
		new Date().toLocaleDateString(s_locale);
	}
	catch(e_locale) {
		throw new RangeError(e_locale.message);
	}

	// set date formats
	let a_date_formats = [
		dt => dt.toLocaleString(s_locale, {year:'numeric', month:'long', day:'numeric'}),

		dt => dt.toLocaleString(s_locale, {year:'numeric', month:'2-digit', day:'2-digit'}),

		(dt) => [
			{year:'numeric'},
			{month:'2-digit'},
			{day:'2-digit'},
		].map(h => dt.toLocaleString(s_locale, h)).join('-'),

		// (dt) => {
		// 	let t_unix = (dt.getTime() / 1000);
		// 	return (t_unix < 0? '-': '+')+t_unix+' Unix epoch time (seconds)';
		// },
	];

	// make function to dress cell
	let f_literals_date_time = (h_literal, d_cell) => {
		// jquery cover dom object
		let q_cell = $(d_cell);

		// append calendar icon
		let q_icon = $('<span class="icon fa fa-calendar" title="cycle display format" />').appendTo(q_cell);

		// append date text
		let q_text = $('<span class="text" />').appendTo(q_cell);

		// track format cycle index
		let i_format = 0;

		// parse date
		let dt = new Date(Date.parse(h_literal.value));

		// in case toLocaleString doesn't support options
		try {
			// set format string
			q_text.text(a_date_formats[i_format](dt));

			// bind click event
			q_icon.click(() => {
				// cycle next format index
				i_format = (++i_format) % a_date_formats.length;

				// set format string
				q_text.text(a_date_formats[i_format](dt));
			});
		}
		// use default
		catch(e) {
			q_text.text(dt.toLocaleString());
		}
	};


	// construct plugin
	return {
		// identify this plugin by its npm name
		id: 'phuzzy-xsd',

		// handle the following datatypes
		datatypes: {
			// date/time
			[tts('xsd:date')]: f_literals_date_time,
			[tts('xsd:dateTime')]: f_literals_date_time,

			// primitives
			[tts('xsd:integer')]: () => 'number',
			[tts('xsd:decimal')]: () => 'number',
			[tts('xsd:double')]: () => 'number',
			[tts('xsd:boolean')]: () => 'boolean',
		},
	};
};

