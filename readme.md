# Cowboy Costume Contest Website

This is a Node.js site built on top of [flatiron](http://flatironjs.org/) that was used to accept contest entries from a PhoneGap [application](https://github.com/meltmedia/cowboy-contest-app) and then watch Twitter for tweets containing a specific hashtag during a predetermined time range and count each tweet as a vote and save it to a mongodb.

## Installation Instructions

1. `git clone git@github.com:meltmedia/cowboy-contest-site.git`
2. `cd cowboy-contest-site`
3. `npm install`
4. `cp config/config-sample.json config/config.json`
5. Populate `config/config.json` with your mongodb credentials (we used [monqohq](https://mongohq.com/home)) and Twitter keys ([create an app if you haven't already](https://dev.twitter.com/apps/new))
6. `npm start`

This will get your site up and running the port specified in the config file.

## mongodb Integration

We used [monqohq](https://mongohq.com/home) to host our mongodb, but other options should suffice as well. Check out `lib/model/model.js` for the schema we used to track entries and votes. There is also a Controller table that we used as an authentication tool to authorize entries based on a token.

## Twitter Integration

You first must [create an app](https://dev.twitter.com/apps/new) so that Twitter will supply you with the required keys to access the Twitter API. You must also decide on a hashtag to watch Twitter for as well as a start and stop time for the Twitter watch. All of this information goes in the config file.

### License MIT
Copyright (c) 2012 meltmedia

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.