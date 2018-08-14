const axios = require('axios');

const GET_COMMENT_IN_MARKDOWN = require('../github/getCommentInMarkdown.js');
const POST_GITHUB_COMMENT = require('../github/postGithubComment.js');

const GITHUB = moduleIsAvailable('../../github.json') ? require('../../github.json') : false;

const REPO_SLUG = process.env.TRAVIS_REPO_SLUG || GITHUB.repo;
const PR_ID = process.env.TRAVIS_PULL_REQUEST || GITHUB.pr_id;
const GH_TOKEN = process.env.GITHUB_TOKEN || GITHUB.token;

function moduleIsAvailable (path) {
    try {
        require.resolve(path);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = function(results) {
    // accumulate the errors and warnings
    const report = results.reduce(function(seq, current) {
        current.messages.forEach(function(msg) {
            var logMessage = {
                filePath: current.filePath,
                ruleId: msg.ruleId,
                message: msg.message,
                line: msg.line,
                column: msg.column
            };

            if (msg.severity === 1) {
                logMessage.type = "warning";
                seq.warnings.push(logMessage);
            }
            if (msg.severity === 2) {
                logMessage.type = "error";
                seq.errors.push(logMessage);
            }
        });
        return seq;
    }, {
        errors: [],
        warnings: []
    });

    let detailedReport = '';

    if (report.errors.length > 0 || report.warnings.length > 0) {
        detailedReport = report.errors.concat(report.warnings).map(function(msg) {
            let reportItem = '';
            reportItem+= '<p>'
            reportItem+= '**' + msg.type.toUpperCase() + '** : ' + msg.ruleId + '<br />';
            reportItem+= msg.message + ' <br />';
            reportItem+= '__' + msg.filePath.replace('/home/travis/build/', '') + ':' + msg.line + ':' + msg.column + '__ <br />';
            reportItem+= '</p>';

            return reportItem;
        }).join('');
    }

    let warningsAndErrors = '';

    if (report.errors.length > 0 || report.warnings.length > 0) {
        warningsAndErrors = '';
        warningsAndErrors+= '**ERRORS**: ' + report.errors.length + ' <br />';
        warningsAndErrors+= '**WARNINGS**: ' + report.warnings.length + '️ </p>';
    }


    let finalComment = '';
    finalComment+= '<h2>Total:</h2> ' + warningsAndErrors +' \n';
    finalComment+= '<br />';
    finalComment+= '<h2>Report:</h2>' + detailedReport + '\n';


    if(report.errors.length > 0 || report.warnings.length > 0) {

        let sanitisedComment = sanitizeTemplateString(finalComment);

        GET_COMMENT_IN_MARKDOWN(JSON.parse(sanitisedComment), GH_TOKEN)
            .then(function (response) {
                let data = JSON.stringify(response.data, jsonEscape);
                data[0] = '';
                data[data.length -1] = '';
                console.log('MARKED: ', data);
                POST_GITHUB_COMMENT(data, REPO_SLUG, PR_ID, GH_TOKEN);
            })
            .catch(function (error) {
                console.error(error);
            });

    }

    function sanitizeTemplateString(templateString) {
        return JSON.stringify(templateString);
    }

    function jsonEscape(key, str)  {
        if (typeof(str)!="string") return str;
        return str.replace(/\n/g, "");
    }
    // console.log('finalComment: ', finalComment)

    return finalComment;

};
