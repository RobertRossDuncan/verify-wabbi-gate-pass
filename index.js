const core = require('@actions/core');
const github = require('@actions/github');

const getTicketKeys = require('./getTicketKeys');
const getWabbiGatePass = require('./getWabbiGatePass');

const GATE_PASSED = 'Associated Wabbi Gate Passed';
const GATE_FAILED = 'Associated Wabbi Gate Failed';

// Function determining Wabbi Gate Status of associated pull request
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

	// Debug Remove the following debug code before release
	console.log(`The PR commits url is ${commitsUrl}`);
	console.log(`The PR source is ${pullRequestSource}`);
	console.log(`The PR title is ${pullRequestTitle}`);
	// Debug Remove the above debug code before release

	try {
		// Get Jira ticket keys associated with the pull request
		let ticketKeys = await getTicketKeys(jiraPrefixes,
			pullRequestTitle,
			pullRequestSource,
			commitsUrl,
			githubToken);

		console.log(`The ticket keys are ${ticketKeys}`); // Debug Remove the following debug code before release

		// Obtain the Wabbi Gate status associated with ticket keys
		let gateStatus = await getWabbiGatePass(wabbiHost,
			wabbiGateToken,
			wabbiProjectId,
			wabbiGateId,
			ticketKeys);

		// Based on wabbi gate status process PR
		if (gateStatus) {
			core.setOutput('status', GATE_PASSED);
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
