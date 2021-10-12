const bent = require('bent');

const getWabbiGatePass = async (wabbiHost, wabbiGateToken,
	wabbiProjectId, wabbiGateId, ticketKeys) => {

	// if not ticket keys array is empty or does not exist, the gate pass status is undefined
	if (!Array.isArray(ticketKeys) || !ticketKeys.length) {
		return undefined;
	}

	// Define wabbi gates endpoint
	const authenticateUrl = `${wabbiHost}/auth/refresh`;
	const postAuthenticate = bent(authenticateUrl, 'POST', 'json');
	const gatesUrl = `${wabbiHost}/api/projects/${wabbiProjectId}/security-gates/${wabbiGateId}/passes`;
	const postGates = bent(gatesUrl, 'POST', 'json');

	// Define authentication header for authenticate endpoint
	const authenticateHeader = {
		Authorization: `Bearer ${wabbiGateToken}`
	};

	// Access wabbi gate with Jira Ticket Ids info and get gate status
	let result = await postAuthenticate(null, {}, authenticateHeader);
	const tokenHeader = {
		'Content-Type': 'application/json',
		'Content-Length': 0,
		Authorization: `Bearer ${result.accessToken}`
	};
	const gatesBody = {
		ticketKeys
	};

	result = await postGates(null, gatesBody, tokenHeader);
	let status = result && result.lastPass ? result.lastPass.status : undefined;
	return status;
};

module.exports = getWabbiGatePass;
