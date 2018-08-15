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
    console.log('result: ', JSON.stringify(results));

    const report = results.map(resultItem => {

        let { warnings: warnings, source: fileName } = resultItem;

        console.log('fileName:', fileName);
        let resultItemText = '### File: __' + fileName.replace('/home/travis/build/', '') + '__';

        const fileErrors = warnings.map(warningItem => {

            let warningReportItem = '<p>';
            warningReportItem+= '**' + warningItem.severity.toUpperCase() + '** : ' + warningItem.rule + '<br />';
            warningReportItem+= warningItem.text + ' <br />';
            warningReportItem+= '</p>';
            warningReportItem+= '<hr />';

            return warningReportItem;

        }).join('');

        resultItemText += fileErrors;
        return resultItemText;

    }).join('');

    // console.log('report: ', report);


    let finalComment = '<h2>STYLELINT Report:</h2>' + report + '\n';

    if(results.length > 0) {

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

    return results;
}


function sanitizeTemplateString(templateString) {
    return JSON.stringify(templateString);
}

function jsonEscape(key, str)  {
    if (typeof(str)!="string") return str;
    return str.replace(/\n/g, "");
}



