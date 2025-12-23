const Joi=require("joi");

const listingSchema=Joi.object({
  listing:Joi.object({
    title:Joi.string().required(),
    description:Joi.string().allow(""),
    image:Joi.string().uri().allow(""),
    price:Joi.number().min(0).required(),
    location:Joi.string().required(),
    country:Joi.string().required()
  }).required()
});

module.exports={listingSchema};