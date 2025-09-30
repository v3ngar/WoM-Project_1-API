require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
 try{

 
const authHeader = req.headers['authorization']
console.log('authorize jwt: ' + authHeader)
const token = authHeader?.split(' ')[1]

//verifiera JWT
const userData = jwt.verify(token, process.env.JWT_SECRET)
console.log(`token authorized for user ${userData.sub} ${userData.name}`)
console.log("inne i auth");
//lägg med userdata i request objektet
req.userData = userData
next() 

} catch (error){
    res.status(401).send({
    message: "Authorization error",
    error: error.message
}) }

    
}