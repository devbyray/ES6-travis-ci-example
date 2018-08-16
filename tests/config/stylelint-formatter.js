const GET_COMMENT_IN_MARKDOWN = require('../github/getCommentInMarkdown.js')
const POST_GITHUB_COMMENT = require('../github/postGithubComment.js')
const POST_GITHUB_COMMIT_STATUS = require('../github/postGithubCommitStatus.js')
const IS_MODULE_AVAILABLE = require('./isModuleAvailable.js')
const GITHUB = IS_MODULE_AVAILABLE('../../github.json') ? require('../../github.json') : false

const REPO_SLUG = process.env.TRAVIS_REPO_SLUG || GITHUB.repo
const PR_ID = process.env.TRAVIS_PULL_REQUEST || GITHUB.pr_id
const GH_TOKEN = process.env.GITHUB_TOKEN || GITHUB.token
const GH_COMMIT = process.env.TRAVIS_COMMIT || GITHUB.commit
const TR_BUILD_ID = process.env.TRAVIS_BUILD_ID || null

module.exports = function (results) {
  if (results.length > 0) {
    POST_GITHUB_COMMIT_STATUS({
      state: 'error',
      description: 'Stylelint has found some errors in the styling via Travis-CI',
      context: 'lint/stylelint'
    }, REPO_SLUG, GH_COMMIT, TR_BUILD_ID, GH_TOKEN)

    const report = results.map(resultItem => {
      let { warnings, source: fileName } = resultItem

      let resultItemText = '### File: __' + fileName.replace('/home/travis/build/', '') + '__'

      const fileErrors = warnings.map(warningItem => {
        let warningReportItem = '<p>'
        warningReportItem += '**' + warningItem.severity.toUpperCase() + '** : ' + warningItem.rule + '<br />'
        warningReportItem += warningItem.text + ' <br />'
        warningReportItem += '</p>'
        warningReportItem += '<hr />'

        return warningReportItem
      }).join('')

      resultItemText += fileErrors
      return resultItemText
    }).join('')

    // console.log('report: ', report);

    let finalComment = '<h2>STYLELINT Report:</h2>' + report + '\n'

    if (results.length > 0) {
      let sanitisedComment = sanitizeTemplateString(finalComment)

      GET_COMMENT_IN_MARKDOWN(JSON.parse(sanitisedComment), GH_TOKEN)
        .then(function (response) {
          let data = JSON.stringify(response.data, jsonEscape)
          data[0] = ''
          data[data.length - 1] = ''
          POST_GITHUB_COMMENT(data, REPO_SLUG, PR_ID, GH_TOKEN)
        })
        .catch(function (error) {
          console.error(error)
        })
    }
    return results
  } else {
    POST_GITHUB_COMMIT_STATUS({
      state: 'success',
      description: 'Stylelint thinks your CSS looks great!',
      context: 'lint/stylelint'
    }, REPO_SLUG, GH_COMMIT, TR_BUILD_ID, GH_TOKEN)

    return true
  }
}

function sanitizeTemplateString (templateString) {
  return JSON.stringify(templateString)
}

function jsonEscape (key, str) {
  if (typeof (str) !== 'string') return str
  return str.replace(/\n/g, '')
}
