const request = require('request');
const executeSelenium = require('./executeSelenium');

/**
* @description Executes scraping in workers according to values in current siphon object
* @return {Object} The siphon object to allow method chaining
*/
module.exports = function execute() {
  const workerURL = this.workerURL;

  // Detects if user wants to use Selenium and applies custom logic
  if (this.seleniumOptions) {
    executeSelenium(this.seleniumOptions, workerURL);
    return this;
  }

  // Build up options object for GET request using request module
  let requestOptions = { url: workerURL };
  if (this.headers) {
    requestOptions = Object.assign(requestOptions, { headers: this.headers });
  }

  // Rotate proxies
  if (this.proxies && this.proxies[0]) {
    curProxy = this.proxies[Math.floor(Math.random() * this.proxies.length)]
    requestOptions = Object.assign(requestOptions, { proxy: curProxy });
  }
  
  request(requestOptions, (err, response, html) => {
    if (err) {
      return process.send({
        type: 'error',
        error: { description: 'error with http request', error: err, url: workerURL }
      });
    };

    // If user processes HTML directly...
    if (this.html) {
      process.send({
        type: 'data',
        data: { data: this.html(html, response), url: workerURL }
      });
      return this;
    }

    // Push the searchTerm matches from the html to the data array
    const matchArray = [];
    this.searchTerms.forEach(regex => {
      const matches = html.match(regex);
      if (matches) {
        delete matches.index;
        delete matches.input;
        matchArray.push(matches);
      } else {
        matchArray.push('no matches for regex: ' + regex.toString());
      }

      process.send({
        type: 'data',
        data: { data: matchArray, url: workerURL }
      });
    });

    return this;
  });
}
