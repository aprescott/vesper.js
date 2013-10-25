# Vesper

Vesper.js is a tiny library to detect same-origin redirects.

In English, if /your/page contains a link to /foo, and /foo redirects to /bar,
you could  detect the /foo -> /bar redirect and do something, such as
passively record /your/page as requiring old URLs to be updated.

# Usage

    <script src="vesper.js"></script>
    <script>
        Vesper.configure({
            onRedirected: function(redirectSource, redirectTarget, originatingPage) {
                console.log("redirect from " + redirectSource + " to " + redirectTarget);
                console.log("redirect found on " + originatingPage);
            }
        });
    </script>

Vesper has no dependencies, but does rely on two features from HTML5:

    * Navigation Timing, specifically window.performance.navigation
    * Web Storage, specifically sessionStorage

Due to browser restrictions, redirects can only be detected if both
source and target satisfy the same-origin policy.

Thanks to Peter Cooper <http://peterc.org/> for the name.

# License and contributing

Copyright (c) 2013 Adam Prescott <https://aprescott.com>.

Vesper is released under the MIT license. See LICENSE for details.

The quickest way to get changes contributed:

1. Visit the [GitHub repository for Vesper](https://github.com/aprescott/vesper.js).
2. [Fork the repository](https://help.github.com/articles/fork-a-repo).
3. Check out a branch on the latest master for your change: `git checkout -b master new-feature` --- do not make changes on `master`!
4. [Send a pull request on GitHub](https://help.github.com/articles/fork-a-repo), including a description of what you've changed. (Note: your contribution will be assumed to be under the same terms of the project by default.)
