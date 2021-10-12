const bent = require('bent');

const getTicketKeys = async (jiraPrefixes, pullRequestTitle, pullRequestSource,
	commitsUrl, githubToken) => {

	// Define regular expressions to obtain Jira Ticket IDs
	const prefixes = jiraPrefixes.replace(/,/g, '|');
	const ticketKeyAtBeginning = new RegExp(`^(${prefixes})-\\d+`, 'g');
	const ticketKeyAnywhere = new RegExp(`\\b(${prefixes})-\\d+`, 'g');

	const getCommits = bent(commitsUrl, 'GET', 'json');

	const gitHeader = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'node/12',
		Authorization: `bearer ${githubToken}`
	};

	try {
		// Retrieve commit messages and extract any Jira Ticket Keys
		let commitsArray = await getCommits(null, null, gitHeader);

		let ticketKeys = [];
		for (let element of commitsArray) {
			let ticketKeysInMessage = element.commit && element.commit.message ?
				element.commit.message.match(ticketKeyAnywhere) : undefined ;
			if (ticketKeysInMessage) {
				ticketKeys = ticketKeys.concat(ticketKeysInMessage);
			}
		}

		// Get source branch, PR title and extract any Jira Ticket Keys
		let ticketKeyInSource = pullRequestSource.match(ticketKeyAtBeginning);
		if (ticketKeyInSource) {
			ticketKeys = ticketKeys.concat(ticketKeyInSource);
		}
		let ticketKeyInTitle = pullRequestTitle.match(ticketKeyAtBeginning);
		if (ticketKeyInTitle) {
			ticketKeys = ticketKeys.concat(ticketKeyInTitle);
		}
		return [...new Set(ticketKeys)];
	}
	catch (error) {
		throw new Error(`Failed to obtain ticket keys ${error.message}`);
	}
};

module.exports = getTicketKeys;