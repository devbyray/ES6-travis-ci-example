const axios = require('axios');
axios.defaults.headers.post['Content-Type'] = 'application/vnd.github.v3.html+json';

const REPO_SLUG = process.env.TRAVIS_REPO_SLUG;
const PR_ID = process.env.TRAVIS_PULL_REQUEST;
const GH_TOKEN = process.env.GITHUB_TOKEN;

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
            return (
                `   <p>
                    **${msg.type.toUpperCase()}** : ${msg.ruleId} <br />
                    ${msg.message} <br />
                    __${msg.filePath.replace('/home/travis/build/', '')}:${msg.line}:${msg.column}__ <br />
                    </p>
                `
            );
        }).join('');
    }

    let warningsAndErrors = '';

    if (report.errors.length > 0 || report.warnings.length > 0) {
        warningsAndErrors = `
        <p>**Errors**: ${report.errors.length} <br />
        **Warnings**: ${report.warnings.length} </p>
        `
    }


    const finalComment = '<p>**Total**:' + warningsAndErrors + '</p>' +
        '<p>**Report**: ' + detailedReport + '</p>';


    if(report.errors.length > 0 || report.warnings.length > 0) {

        let sanitisedComment = sanitizeTemplateString(finalComment);

        getCommentInMarkdown(JSON.parse(sanitisedComment))
            .then(function (response) {
                let data = JSON.stringify(response.data, jsonEscape);
                // data = data.startsWith('"') ? data[0] = '' : data;
                console.log('MARKED: ', data);
                postGithubComment(data);
            })
            .catch(function (error) {
                console.error(error);
            });

    }

    function getCommentInMarkdown(markDownComment) {
        return axios.post(`https://api.github.com/markdown?access_token=${GH_TOKEN}`, {
            text: markDownComment,
            mode: "gfm",
            context: "github/gollum"
        })
    }

    function postGithubComment(comment) {
        return axios.post(`https://api.github.com/repos/${REPO_SLUG}/issues/${PR_ID}/comments?access_token=${GH_TOKEN}`, {
                    body: comment,
                })
                .then(function (response) {
                    // console.log('Posted comment!');
                    // console.log(response);
                })
                .catch(function (error) {
                    console.error('Didn\'t Posted comment!');
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
