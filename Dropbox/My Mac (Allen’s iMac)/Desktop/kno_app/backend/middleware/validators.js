const { body, validationResult } = require('express-validator');

function check(view) {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array()[0].msg;
      // If AJAX/json requested, return JSON
      if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
        return res.status(400).json({ error: msg });
      }
      // Render the provided view with error
      return res.render(view, { error: msg, ...req.body });
    }
    return next();
  };
}

exports.register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.login = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.forgot = [
  body('email').trim().isEmail().withMessage('Valid email is required')
];

exports.reset = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.answer = [
  body('questionId').notEmpty().withMessage('questionId is required'),
  body('answerText').trim().notEmpty().withMessage('Answer text is required')
];

exports.savePage = [
  body('questionId').notEmpty().withMessage('questionId is required')
];

exports.check = check;

module.exports = exports;
