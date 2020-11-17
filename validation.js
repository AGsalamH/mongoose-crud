const {check, validationResult} = require('express-validator');

const productValidationRules = ()=>{
    return [
        check('name', 'Should be at least 2 Characters').trim().isLength({min: 2}),
        check('price', 'Should be a number >= 0').isNumeric({min:0}),
        check('description').optional()
    ]
};


const validate = (req, res, next)=>{
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err=>{
        extractedErrors.push({[err.param]:err.msg})
    });
    res.status(422).json({
        errors: extractedErrors
    });
}

module.exports = {
    productValidationRules,
    validate
}