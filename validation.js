const {check, validationResult} = require('express-validator');

const productValidationRules = ()=>{
    return [
        check('name').trim().isLength({min: 2}),
        check('price').isNumeric({min:0}),
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