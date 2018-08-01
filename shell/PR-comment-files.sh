#!/bin/bash
set -ev
if [ "$TRAVIS_PULL_REQUEST" != "false" ] ; then
   # hey that's a pull request
   echo "Comment: ${PR_COMMENT}";

   curl -H "Authorization: token ${GITHUB_TOKEN}" -X POST \
    -d "{\"body\": \"${PR_COMMENT}\"}" \
    "https://api.github.com/repos/${TRAVIS_REPO_SLUG}/issues/${TRAVIS_PULL_REQUEST}/comments"

    echo "PR comment!"
fi