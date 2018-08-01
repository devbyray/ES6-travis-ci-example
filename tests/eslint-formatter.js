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
            process.env['PR_COMMENT'] = finalComment;
            return finalComment;
        }
    };
// }