# Wabbi Manage PR JavaScript action
Based on the status of Wabbi gates associated with the Jira ticket keys defined 
in the commit's messages, the pull request's title and the pull request's source
branch, this action will display the Wabbi gate status. If the gate status is
FAILED, the action will fail.

## Inputs
### `wabbiHost`
**Required** URL to Wabbi site
### `wabbiProjectId`
**Required** Wabbi project id associated with the GitHub repo
### `jiraPrefixes`
**Required** Comma separated list of associated Jira project prefixes
### `wabbiGateId`
**Required** Id of the Wabbi gate associated with the GitHub repo
### `wabbiGateToken`
**Required** Token to access the wabbi gate. save as secret named GATE_TOKEN
### `githubtoken`
**Required** Token to access GitHub repo data, use githubToken: ${{ GITHUB_TOKEN }}

## Outputs
### `status`
The status of the Wabbi gate pass for the associated ticket keys.

## Example usage
```
on: [pull_request]

jobs:
  pull_request_job:
    runs-on: ubuntu-latest
    name: A job to process pull request validation
    steps:
      - name: proccess pull request
        id: process_pr
        uses: RobertRossDuncan/pr_sandbox@master
        with:
          wabbiHost: https://symphony.wabbi.io
          wabbiProjectId: 1
          jiraPrefixes: AB,CD,EF
          wabbiGateId: 1
          wabbiGateToken: ${{ secrets.GATE_TOKEN }}
          githubToken: ${{ secrets.GITHUB_TOKEN }}
      - name: pull process status
        run: echo "pr process status ${{ steps.process_pr.outputs.status }}"
```