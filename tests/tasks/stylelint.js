const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')
const STYLELINTFORMATTER = require('../config/stylelint-formatter')
const POST_GITHUB_COMMIT_STATUS = require('../github/postGithubCommitStatus.js')
const IS_MODULE_AVAILABLE = require('../config/isModuleAvailable')
const GITHUB = IS_MODULE_AVAILABLE('../../github.json') ? require('../../github.json') : false
const LINT_IGNORE = require('../../lint-ignore.json')

const REPO_SLUG = process.env.TRAVIS_REPO_SLUG || GITHUB.repo
const GH_TOKEN = process.env.GITHUB_TOKEN || GITHUB.token
const GH_COMMIT = process.env.TRAVIS_COMMIT || GITHUB.commit
const TR_BUILD_ID = process.env.TRAVIS_BUILD_ID || null

module.exports = function () {
  if (TR_BUILD_ID) {
    POST_GITHUB_COMMIT_STATUS({
      state: 'pending',
      description: 'Stylelint is checking the styling in Travis-CI',
      context: 'lint/stylelint'
    }, REPO_SLUG, GH_COMMIT, TR_BUILD_ID, GH_TOKEN)
  }

  return gulp
    .src(['src/**/*.{scss,css}', ...LINT_IGNORE.stylelint])
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true},
        {formatter: STYLELINTFORMATTER}
      ]
    }))
}
