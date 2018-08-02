const axios = require('axios');

const REPO_SLUG = process.env.TRAVIS_REPO_SLUG;
const PR_ID = process.env.TRAVIS_PULL_REQUEST;
const GH_TOKEN = process.env.GITHUB_TOKEN;

// if(process.env.TRAVIS_REPO_SLUG) {
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
                    "\n" +
                    msg.type +
                    ": " +
                    msg.ruleId +
                    "\n  " +
                    msg.message +
                    "\n  " +
                    msg.filePath +
                    ":" +
                    msg.line +
                    ":" +
                    msg.column
                );
            })
            .join("\n");
        }

        let warningsAndErrors = '';

        if (report.errors.length > 0 || report.warnings.length > 0) {
            warningsAndErrors =
                "Errors: " +
                report.errors +
                ", Warnings: " +
                report.warnings +
                "\n";
        }


        const finalComment = `
            Total: ${warningsAndErrors} \n

            Report: ${detailedReport}
        `;


        if(report.errors.length > 0 || report.warnings.length > 0) {
            // process.env['PR_COMMENT'] = finalComment;

            axios.post(`https://api.github.com/repos/${REPO_SLUG}/issues/${PR_ID}/comments?access_token=${GH_TOKEN}`, {
                body: finalComment,
              })
              .then(function (response) {
                console.log(response);
              })
              .catch(function (error) {
                console.error(error);
              });
        }

        return finalComment;

    };
// }