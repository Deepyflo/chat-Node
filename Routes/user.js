const express = require('express');
const { check, validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../Model/userModel');

router.post(
    "/signup", [
        check("username", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            username,
            password
        } =req.body;
        try {
            let user = await User.findOne({
                username
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exist"
                });
            }

            user = new User({
                username,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            
            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, "randomstring", {
                expiresIn: 10000
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    token
                });
            }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

module.exports = router;