/**
* @description Updates the number of tries on the siphon object
* @param {Number} triesToAdd - Allows additional tries for each job (defaults to 1)
* @return {Object} The siphon object to allow method chaining
*/
function retries(triesToAdd = 1) {
  if (!Number.isInteger(triesToAdd)) throw new Error('Please insert integer into .retries method');
  this.tries += triesToAdd;
  return this;
}

module.exports = retries;