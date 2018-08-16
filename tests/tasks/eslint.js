const gulp = require('gulp')
const eslint = require('gulp-eslint')
const POST_GITHUB_COMMIT_STATUS = require('../github/postGithubCommitStatus.js')
const IS_MODULE_AVAILABLE = require('../config/isModuleAvailable')
const GITHUB = IS_MODULE_AVAILABLE('../../github.json') ? require('../../github.json') : false

const REPO_SLUG = process.env.TRAVIS_REPO_SLUG || GITHUB.repo
const GH_TOKEN = process.env.GITHUB_TOKEN || GITHUB.token
const GH_COMMIT = process.env.TRAVIS_COMMIT || GITHUB.commit
const TR_BUILD_ID = process.env.TRAVIS_BUILD_ID || null

module.exports = function () {
  if (TR_BUILD_ID) {
    POST_GITHUB_COMMIT_STATUS({
      state: 'pending',
      description: 'Eslint is checking the JavaScript in Travis-CI',
      context: 'lint/eslint'
    }, REPO_SLUG, GH_COMMIT, TR_BUILD_ID, GH_TOKEN)
  }

  return gulp.src(['src/**/*.js', '!tests/**/*.js', '!./*.js'], { sourcemaps: true })
  // eslint() attaches the lint output to the "eslint" property
  // of the file object so it can be used by other modules.
    .pipe(eslint())
  // eslint.format() outputs the lint results to the console.
  // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format('./tests/config/eslint-formatter.js'))
  // To have the process exit with an error code (1) on
  // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError())
}
