const core = require('@actions/core');
const github = require('@actions/github');

const getTicketKeys = require('./getTicketKeys');
const getWabbiGatePass = require('./getWabbiGatePass');

const GATE_PASSED = 'Associated Wabbi Gate Passed';
const NO_GATE_STATUS = 'No Associated Wabbi Gate Status';
const GATE_FAILED = 'Associated Wabbi Gate Failed';
const PASSED_STATUS = 'PASSED';

/**
 * This GitHub action determines the ticket keys associated with the pull request.
 * The action displays the Wabbi gate status for the associated ticket keys.
 * The action fails if the Wabbi gate status is FAILED
 * @param {Object} pullRequest GitHub pull request associated with action
 */
const processPullRequestEvent = async (pullRequest) => {
	// Obtain pull request information
	const commitsUrl = pullRequest._links.commits.href;
	const pullRequestSource = pullRequest.head.ref;
	const pullRequestTitle = pullRequest.title;

	// Obtain wabbi configuration info
	const wabbiHost = core.getInput('wabbiHost');
	const wabbiProjectId = core.getInput('wabbiProjectId');
	const jiraPrefixes = core.getInput('jiraPrefixes');
	const wabbiGateId = core.getInput('wabbiGateId');
	const wabbiGateToken = core.getInput('wabbiGateToken');

	// Obtain github access info
	const githubToken = core.getInput('githubToken');

	try {
		// Get Jira ticket keys associated with the pull request
		let ticketKeys = await getTicketKeys(jiraPrefixes,
			pullRequestTitle,
			pullRequestSource,
			commitsUrl,
			githubToken);

		// Display extracted ticket keys within action console
		console.log(`The ticket keys are ${ticketKeys}`);

		// Obtain the Wabbi Gate status associated with ticket keys
		let gateStatus = await getWabbiGatePass(wabbiHost,
			wabbiGateToken,
			wabbiProjectId,
			wabbiGateId,
			ticketKeys);

		// Define Wabbi gate status and action pass / fail
		if (gateStatus  === PASSED_STATUS) {
			core.setOutput('status', GATE_PASSED);
		}
		else if (gateStatus === undefined || gateStatus === null) {
			core.setOutput('status', NO_GATE_STATUS);
		}
		else {
			core.setOutput('status', GATE_FAILED);
			core.setFailed(GATE_FAILED);
		}
	}
	catch (error) {
		core.setFailed(error.message);
	}
};

// Driver function to handle async calls
Promise.resolve(
	processPullRequestEvent(
		github.context.payload.pull_request
	)
);
