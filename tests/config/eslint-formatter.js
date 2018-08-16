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

console.log('GH_COMMIT: ', GH_COMMIT);


module.exports = function (results) {
  if (results.length > 0) {
    POST_GITHUB_COMMIT_STATUS({
      state: 'error',
      description: 'Eslint found some errors/warnings in the JavaScript via Travis-CI',
      context: 'lint/eslint'
    }, REPO_SLUG, GH_COMMIT, TR_BUILD_ID, GH_TOKEN)

    // accumulate the errors and warnings
    const report = results.reduce(function (seq, current) {
      current.messages.forEach(function (msg) {
        var logMessage = {
          filePath: current.filePath,
          ruleId: msg.ruleId,
          message: msg.message,
          line: msg.line,
          column: msg.column
        }

        if (msg.severity === 1) {
          logMessage.type = 'warning'
          seq.warnings.push(logMessage)
        }
        if (msg.severity === 2) {
          logMessage.type = 'error'
          seq.errors.push(logMessage)
        }
      })
      return seq
    }, {
      errors: [],
      warnings: []
    })

    let detailedReport = ''

    if (report.errors.length > 0 || report.warnings.length > 0) {
      detailedReport = report.errors.concat(report.warnings).map(function (msg) {
        let reportItem = ''
        reportItem += '<p>'
        reportItem += '**' + msg.type.toUpperCase() + '** : ' + msg.ruleId + '<br />'
        reportItem += msg.message + ' <br />'
        reportItem += '__' + msg.filePath.replace('/home/travis/build/', '') + ':' + msg.line + ':' + msg.column + '__ <br />'
        reportItem += '</p>'

        return reportItem
      }).join('')
    }

    let finalComment = '<h2>ESLINT Report:</h2>' + detailedReport + '\n'

    if (report.errors.length > 0 || report.warnings.length > 0 && PR_ID) {
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

    return finalComment
  } else {
    POST_GITHUB_COMMIT_STATUS({
      state: 'success',
      description: 'Eslint thinks your JavaScript looks great!',
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
