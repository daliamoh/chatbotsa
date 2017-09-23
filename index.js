var restify = require('restify');
var builder = require('botbuilder');
var jsonfile = require('jsonfile');


// Setup Restify Server
var server = restify.createServer();
process.env.VERIFICATION_TOKEN = "bolla";
server.listen(process.env.port || process.env.PORT || 5000, function () {
	console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
	appId: 'f3420b19-762f-407b-87d3-fb79e6d95596',
	appPassword: 'e99zKFSZHm4Cx7Q0G2gbPMx'
	//appId: process.env.MICROSOFT_APP_ID,
	//appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
	function (session) {

		var file = 'Phones.json'
		var user_id = session.message.user.id

		jsonfile.readFile(file, function (err, obj) {
			var mobile = 0
			session.isExsitUser = false

			for (var i = 0; i < obj.data.length; i++) {
				if (obj.data[i].hasOwnProperty(user_id)) {
					session.isExsitUser = true
					mobile = obj.data[i][user_id]
					break
				}
			}

			if (session.isExsitUser) { // user already exist
				session.send(`There no offer for now. we will call u on ${mobile} soon.`);
				session.endDialog();
			} else {
				session.send("Welcome to Chatbotsa!");
				builder.Prompts.text(session, "Please type your mobile phone number to call you in case we have offers.");
			}
		})

	},
	function (session, results) {
		if (!session.isExsitUser) {
			var mobile = results.response;
			session.send(`Thank you for submitting ur phone number `)

			var file = 'Phones.json'
			var user_id = session.message.user.id

			jsonfile.readFile(file, function (err, obj) {
				var element = {}
				element[user_id] = mobile
				obj.data.push(element)
				jsonfile.writeFileSync(file, obj, { spaces: 2, EOL: '\r\n' })
			})
		}
		session.endDialog();
	}
]);

