
# Simple HTML/CSS exercise
##### Antonis Karamitros, 2014
- [Live demo](http://antouank.github.io/b_test/deploy/)
- [Source code](https://github.com/AntouanK/b_test)


Description for the exercise was really simple, given the ai file of a partial page design, implement it with HTML and CSS.

For this exercise, I made a simple gulp build process, in order to keep my develop files separate from the deliverable/deployed output.

## Usage

- clone the git repo `git clone https://github.com/AntouanK/b_test.git`
- install npm packages using `npm i` ( assuming you have node installed )
- build the project using `gulp build` , output goes to /deploy folder
- iptionally, you can start a local server to see the result. run `gulp serve` ( server will be listening to localhost:8000 )

## Build process

Within the build process, with gulp we do some simple and common tasks like :
- clean the deploy folder
- pass the JS through a linter ( ESLint is preferred )
- load the `index.html` file in memory
- gather the CSS files
  - load the 3rd party CSS
  - load the develop LESS files and compile them to CSS
  - concatenate all of them and produce the final CSS
- inline the CSS into the HTML <head> ( merely for performance reasons )
- output the `index.html` file to the deploy folder

Also there is a watcher so tasks are happening while developing ( `gulp watch` )


## Implementation

For the implementation, a simple minimalisting CSS framework was used, [Yahoo's Pure](http://purecss.io/).
The reason was that I always try to use only the bare minimum and only quality 3rdparty libraries, and not bloat my project with unnecessary code.

In this case, pure provides a flexible responsive grid, and it's lightweight.

Pictures were transformed to JPG to save size ( although this is usually a designer issue in order to get the best compression/quality result )
