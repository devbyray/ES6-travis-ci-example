const gulp = require('gulp');
const gulpStylelint = require('gulp-stylelint');
const STYLELINTFORMATTER = require('../config/stylelint-formatter');

module.exports = function() {
	return gulp
		.src(['src/**/*.scss', 'src/**/*.css'])
		.pipe(gulpStylelint({
			reporters: [
				{formatter: 'string', console: true},
				{formatter: STYLELINTFORMATTER}
			]
		}));
}
