// Gatekeeper assignment

// read port off command line
if (process.argv[2]===undefined) {
	console.log("need port.\n");
	process.exit();
}

const PORT_NUM = process.argv[2];
// Notes & Stuff:
//"x-username-and-password": "user=ellen&pass=superSecretPassword"
//
// req.get('x-username-and-password')

const say = (s) => { console.log(s); }
const qs = require('query-string');
// https://www.npmjs.com/package/query-string 

const express = require('express');
const app = express();

const logRequest = (request, response, next) => {
	const logObj = {
		time: (new Date()).toTimeString(),
		method: request.method,
		hostname: request.hostname,
		path: request.path,
		"content type": request.get('Content-Type'),
		query: JSON.stringify(request.query),
		body: JSON.stringify(request.body),
		user: request.user
	}
	console.log(logObj);
	console.log("-------------------------\n");
	next();
};

// here: https://crackstation.net/hashing-security.htm
const USERS = [
{  id: 1,
	firstName: 'Joe',
	lastName: 'Schmoe',
	userName: 'joeschmoe@business.com',
	position: 'Sr. Engineer',
	isAdmin: true,
	// NEVER EVER EVER store passwords in plain text in real life. NEVER!!!!!!!!!!!
	password: 'password'
},
{  id: 2,
	firstName: 'Sally',
	lastName: 'Student',
	userName: 'sallystudent@business.com',
	position: 'Jr. Engineer',
	isAdmin: true,
	// NEVER EVER EVER store passwords in plain text in real life. NEVER!!!!!!!!!!!
	password: 'password'
},
{  id: 3,
	firstName: 'Lila',
	lastName: 'LeMonde',
	userName: 'lila@business.com',
	position: 'Growth Hacker',
	isAdmin: false,
	// NEVER EVER EVER store passwords in plain text in real life. NEVER!!!!!!!!!!!
	password: 'password'
},
{  id: 4,
	firstName: 'Freddy',
	lastName: 'Fun',
	userName: 'freddy@business.com',
	position: 'Community Manager',
	isAdmin: false,
	// NEVER EVER EVER store passwords in plain text in real life. NEVER!!!!!!!!!!!
	password: 'password'
}
];


// write a `gateKeeper` middleware function that:
//  1. looks for a 'x-username-and-password' request header
//  2. parses values sent for `user` and `pass` from 'x-username-and-password'
//  3. looks for a user object matching the sent username and password values
//  4. if matching user found, add the user object to the request object
//     (aka, `req.user = matchedUser`)
function gateKeeper(req, res, next) {
	
	let headerObj = qs.parse( req.get('x-username-and-password') );
	say(headerObj);

	let found = USERS.find( elt => {	
		return (elt.userName == headerObj.user && elt.password == headerObj.password);
	});
	req.user = found;  // undefined if isn't found.

	next();
}

// Add the middleware to your app!
app.use(gateKeeper);
app.use(logRequest);

// this endpoint returns a json object representing the user making the request,
// IF they supply valid user credentials. This endpoint assumes that `gateKeeper` 
// adds the user object to the request if valid credentials were supplied.
app.get("/api/users/me", (req, res) => {
	// send an error message if no or wrong credentials sent
	if (req.user === undefined) {
		return res.status(403).json({message: 'Must supply valid user credentials'});
	}
	// we're only returning a subset of the properties
	// from the user object. Notably, we're *not*
	// sending `password` or `isAdmin`.
	const {firstName, lastName, id, userName, position} = req.user;
	return res.json({firstName, lastName, id, userName, position});
});

app.listen(process.env.PORT || PORT_NUM, () => {
	console.log(`Your app is listening on port ${process.env.PORT || PORT_NUM}`);
});

