# ES6 Travis CI example [![Build Status](https://travis-ci.org/raymonschouwenaar/ES6-travis-ci-example.svg?branch=master)](https://travis-ci.org/raymonschouwenaar/ES6-travis-ci-example)

The main purpose of this project is to make the feedback loop of your work as smooth as possible. You can use Gulp to lint your CSS and JavaScript.

It's also created to do automatic linting when you connected your repository to [Travis-CI](https://travis-ci.org). When connected Gulp will automatically be started when you create a Pull-request.

Use this project as an example or inspiration. Please let me know if you got problems with it or if you got a big success 👍

# Installation

1. Run `npm install` or `yarn`
2. Install [Gulp globally](https://gulpjs.com)

## Connect your Github Repo to Travis-CI

1. Go to [Travis-CI](https://travis-ci.org) website and sign-up with your Github Account.
2. After the sign-up process, go to *profile settings*
3. Find your repo and turn on the switch.
4. Now Travis-CI will detect any push and pull-requests and run Gulp.
5. In order to get a comment on your PR when the linting was a success, create a *Personal access token* on Github.
6. Go to Github, click on your avatar -> settings -> Developer settings -> Personal access token. Create a token and check the box *public_repo* and create the token.
7. Copy the token and go to your repo on Travis-CI, click on the right *More options*, scroll down to *Environment Variables* and create a new one. Name: GITHUB_TOKEN, Value: <your-token>
8. Now you get a success comment on your PR when all the JavaScript and CSS is good by the linters.

# How-to-use

Run `gulp` to run the Eslint and Stylelint task and get your JavaScript and CSS/Scss/Sass tested.

If you run you have added Travis CI to your repository, then these tasks will automatically run on Travis.

## Ignoring files from dependencies
In the `lint-ignore.json` you can specify which files and directories needed to be ignored. Think about JS and CSS from dependencies.

```
{
  "eslint": ["!tests/**/*.js", "!./*.js"],
  "stylelint" : []
}
```

## Pull-request

If you create a pull-request, Travis will run the Gulp tasks and put the errors in a PR comment so you get the feedback and error reports on 1 place.

## Push

If you push a commit to your repository, then Travis will give your commit a status. 

- Pending
- Error
- Failure
- Success

This helps you to see if the Eslint or Stylelint find errors on your commit. So you can have feedback early.


# Todo

- Make JSON file to declare the main folders to look for CSS and JavaScript files.
- Optimize for better scalable architecture.
