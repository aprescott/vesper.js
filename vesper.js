//
// Vesper.js (version 0.1)
//
// Copyright (c) 2013 Adam Prescott <https://aprescott.com/>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Vesper.js is a tiny library to detect same-origin redirects.
// 
// In English, if /your/page contains a link to /foo, and /foo redirects to /bar,
// you could  detect the /foo -> /bar redirect and do something, such as
// passively record /your/page as requiring old URLs to be updated.
//
// Usage:
//
//     <script src="vesper.js"></script>
//     <script>
//         Vesper.configure({
//             onRedirected: function(redirectSource, redirectTarget, originatingPage) {
//                 console.log("redirect from " + redirectSource + " to " + redirectTarget);
//                 console.log("redirect found on " + originatingPage);
//             }
//         });
//     </script>
// 
// Vesper has no dependencies, but does rely on two features from HTML5:
//
//     * Navigation Timing, specifically window.performance.navigation
//     * Web Storage, specifically sessionStorage
//
// Due to browser restrictions, redirects can only be detected if both
// source and target satisfy the same-origin policy.
// 
// Thanks to Peter Cooper <http://peterc.org/> for the name.
//

var Vesper = (function() {
    // on any clicks, record the href of the link clicked as the "previous" page.
    // this is necessary because:
    //
    //   1. there is no event that fires on a page's redirection.
    //   2. the browser follows a redirect without constructing a full JS execution environment
    //      (how can it, there might be no DOM to construct), so there is not even an unload event
    //      to hook into.
    //
    // so we improvise, by hooking into the click event and checking for a href attribute.
    // unfortunately this doesn't track click events that have been added with JS to
    // an element; it might be possible to add an event handler that fires whenever _any other_
    // click event fires, so that if someone does, e.g.,
    //
    //   $("#foo").click(function() { ... });
    //
    // then we can do something in that case.

    var elements = document.getElementsByTagName("a");
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        // add an event listener with a closure to make sure we bind the nested
        // function to the element being iterated over. without this, the final
        // element in getElementsByTagName will be used.
        element.addEventListener("click", (function(element) {
            return function(event) {
                // relying on event.target here is a mistake, because of <a><h1></h1></a> leading to <h1> as the target
                sessionStorage["_dr_redirect_source"] = element.href;
            };
        })(element), false);
    }

    var object = {};
    var redirected = false;

    // the URL of the start of the redirect chain
    var redirectSource = sessionStorage["_dr_redirect_source"];

    // the URL of the end of the redirect chain, which is the page we're on
    var redirectTarget = window.location.href

    if (window.performance && window.performance.navigation && window.performance.navigation.redirectCount) {
        redirected = (window.performance.navigation.redirectCount > 0);
    }

    // default callback, to be overridden
    var onredirected = function(redirectSource, redirectTarget, originatingPage) {};

    object.configure = function(settings) {
        if (settings.onRedirected) {
            onredirected = settings.onRedirected;
        }
    };

    // if we were redirected, then add a DOMContentLoaded event to call the
    // onredirected callback.
    //
    // here be dragons: document.referrer is undefined before the DOM is ready, it seems
    if (redirected) {
        document.addEventListener("DOMContentLoaded", function() {
            onredirected(redirectSource, redirectTarget, document.referrer);
        }, false);
    }

    return object;
})();
