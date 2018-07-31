const gulp = require('gulp');
const gulpStylelint = require('gulp-stylelint');

module.exports = function() {
	return gulp
		.src('src/**/*.scss')
		.pipe(gulpStylelint({
			reporters: [
				{formatter: 'string', console: true}
			]
		}));
}
