// Utility to strip ANSI escape codes from a string
module.exports = function stripAnsi(str) {
  if (!str) return str;
  return str.replace(/[\u001b\u009b][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
};
