require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 885:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const bent = __nccwpck_require__(113);

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

/***/ }),

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 394:
/***/ ((module) => {

"use strict";


const isStream = stream =>
	stream !== null &&
	typeof stream === 'object' &&
	typeof stream.pipe === 'function';

isStream.writable = stream =>
	isStream(stream) &&
	stream.writable !== false &&
	typeof stream._write === 'function' &&
	typeof stream._writableState === 'object';

isStream.readable = stream =>
	isStream(stream) &&
	stream.readable !== false &&
	typeof stream._read === 'function' &&
	typeof stream._readableState === 'object';

isStream.duplex = stream =>
	isStream.writable(stream) &&
	isStream.readable(stream);

isStream.transform = stream =>
	isStream.duplex(stream) &&
	typeof stream._transform === 'function';

module.exports = isStream;


/***/ }),

/***/ 76:
/***/ ((module) => {

"use strict";

const encodings = new Set(['json', 'buffer', 'string'])

module.exports = mkrequest => (...args) => {
  const statusCodes = new Set()
  let method
  let encoding
  let headers
  let baseurl = ''

  args.forEach(arg => {
    if (typeof arg === 'string') {
      if (arg.toUpperCase() === arg) {
        if (method) {
          const msg = `Can't set method to ${arg}, already set to ${method}.`
          throw new Error(msg)
        } else {
          method = arg
        }
      } else if (arg.startsWith('http:') || arg.startsWith('https:')) {
        baseurl = arg
      } else {
        if (encodings.has(arg)) {
          encoding = arg
        } else {
          throw new Error(`Unknown encoding, ${arg}`)
        }
      }
    } else if (typeof arg === 'number') {
      statusCodes.add(arg)
    } else if (typeof arg === 'object') {
      if (Array.isArray(arg) || arg instanceof Set) {
        arg.forEach(code => statusCodes.add(code))
      } else {
        if (headers) {
          throw new Error('Cannot set headers twice.')
        }
        headers = arg
      }
    } else {
      throw new Error(`Unknown type: ${typeof arg}`)
    }
  })

  if (!method) method = 'GET'
  if (statusCodes.size === 0) {
    statusCodes.add(200)
  }

  return mkrequest(statusCodes, method, encoding, headers, baseurl)
}


/***/ }),

/***/ 113:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const http = __nccwpck_require__(605)
const https = __nccwpck_require__(211)
const { URL } = __nccwpck_require__(835)
const isStream = __nccwpck_require__(394)
const caseless = __nccwpck_require__(684)
const bytes = __nccwpck_require__(734)
const bent = __nccwpck_require__(76)
const zlib = __nccwpck_require__(761)
const { PassThrough } = __nccwpck_require__(413)

const compression = {}

/* istanbul ignore else */
if (zlib.createBrotliDecompress) compression.br = () => zlib.createBrotliDecompress()
/* istanbul ignore else */
if (zlib.createGunzip) compression.gzip = () => zlib.createGunzip()
/* istanbul ignore else */
if (zlib.createInflate) compression.deflate = () => zlib.createInflate()

const acceptEncoding = Object.keys(compression).join(', ')

const getResponse = resp => {
  const ret = new PassThrough()
  ret.statusCode = resp.statusCode
  ret.status = resp.statusCode
  ret.statusMessage = resp.statusMessage
  ret.headers = resp.headers
  ret._response = resp
  if (ret.headers['content-encoding']) {
    const encodings = ret.headers['content-encoding'].split(', ').reverse()
    while (encodings.length) {
      const enc = encodings.shift()
      if (compression[enc]) {
        const decompress = compression[enc]()
        decompress.on('error', (e) => ret.emit('error', new Error('ZBufError', e)))
        resp = resp.pipe(decompress)
      } else {
        break
      }
    }
  }
  return resp.pipe(ret)
}

class StatusError extends Error {
  constructor (res, ...params) {
    super(...params)

    Error.captureStackTrace(this, StatusError)
    this.name = 'StatusError'
    this.message = res.statusMessage
    this.statusCode = res.statusCode
    this.json = res.json
    this.text = res.text
    this.arrayBuffer = res.arrayBuffer
    this.headers = res.headers
    let buffer
    const get = () => {
      if (!buffer) buffer = this.arrayBuffer()
      return buffer
    }
    Object.defineProperty(this, 'responseBody', { get })
  }
}

const getBuffer = stream => new Promise((resolve, reject) => {
  const parts = []
  stream.on('error', reject)
  stream.on('end', () => resolve(Buffer.concat(parts)))
  stream.on('data', d => parts.push(d))
})

const decodings = res => {
  let _buffer
  res.arrayBuffer = () => {
    if (!_buffer) {
      _buffer = getBuffer(res)
      return _buffer
    } else {
      throw new Error('body stream is locked')
    }
  }
  res.text = () => res.arrayBuffer().then(buff => buff.toString())
  res.json = async () => {
    const str = await res.text()
    try {
      return JSON.parse(str)
    } catch (e) {
      e.message += `str"${str}"`
      throw e
    }
  }
}

const mkrequest = (statusCodes, method, encoding, headers, baseurl) => (_url, body = null, _headers = {}) => {
  _url = baseurl + (_url || '')
  const parsed = new URL(_url)
  let h
  if (parsed.protocol === 'https:') {
    h = https
  } else if (parsed.protocol === 'http:') {
    h = http
  } else {
    throw new Error(`Unknown protocol, ${parsed.protocol}`)
  }
  const request = {
    path: parsed.pathname + parsed.search,
    port: parsed.port,
    method: method,
    headers: { ...(headers || {}), ..._headers },
    hostname: parsed.hostname
  }
  if (parsed.username || parsed.password) {
    request.auth = [parsed.username, parsed.password].join(':')
  }
  const c = caseless(request.headers)
  if (encoding === 'json') {
    if (!c.get('accept')) {
      c.set('accept', 'application/json')
    }
  }
  if (!c.has('accept-encoding')) {
    c.set('accept-encoding', acceptEncoding)
  }
  return new Promise((resolve, reject) => {
    const req = h.request(request, async res => {
      res = getResponse(res)
      res.on('error', reject)
      decodings(res)
      res.status = res.statusCode
      if (!statusCodes.has(res.statusCode)) {
        return reject(new StatusError(res))
      }

      if (!encoding) return resolve(res)
      else {
        /* istanbul ignore else */
        if (encoding === 'buffer') {
          resolve(res.arrayBuffer())
        } else if (encoding === 'json') {
          resolve(res.json())
        } else if (encoding === 'string') {
          resolve(res.text())
        }
      }
    })
    req.on('error', reject)
    if (body) {
      if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
        body = bytes.native(body)
      }
      if (Buffer.isBuffer(body)) {
        // noop
      } else if (typeof body === 'string') {
        body = Buffer.from(body)
      } else if (isStream(body)) {
        body.pipe(req)
        body = null
      } else if (typeof body === 'object') {
        if (!c.has('content-type')) {
          req.setHeader('content-type', 'application/json')
        }
        body = Buffer.from(JSON.stringify(body))
      } else {
        reject(new Error('Unknown body type.'))
      }
      if (body) {
        req.setHeader('content-length', body.length)
        req.end(body)
      }
    } else {
      req.end()
    }
  })
}

module.exports = bent(mkrequest)


/***/ }),

/***/ 89:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* globals atob, btoa, crypto */
/* istanbul ignore file */

const bytes = __nccwpck_require__(391)

bytes.from = (_from, _encoding) => {
  if (_from instanceof DataView) return _from
  if (_from instanceof ArrayBuffer) return new DataView(_from)
  let buffer
  if (typeof _from === 'string') {
    if (!_encoding) {
      _encoding = 'utf-8'
    } else if (_encoding === 'base64') {
      buffer = Uint8Array.from(atob(_from), c => c.charCodeAt(0)).buffer
      return new DataView(buffer)
    }
    if (_encoding !== 'utf-8') throw new Error('Browser support for encodings other than utf-8 not implemented')
    return new DataView((new TextEncoder()).encode(_from).buffer)
  } else if (typeof _from === 'object') {
    if (ArrayBuffer.isView(_from)) {
      if (_from.byteLength === _from.buffer.byteLength) return new DataView(_from.buffer)
      else return new DataView(_from.buffer, _from.byteOffset, _from.byteLength)
    }
  }
  throw new Error('Unkown type. Cannot convert to ArrayBuffer')
}

bytes.toString = (_from, encoding) => {
  _from = bytes(_from, encoding)
  const uint = new Uint8Array(_from.buffer, _from.byteOffset, _from.byteLength)
  const str = String.fromCharCode(...uint)
  if (encoding === 'base64') {
    /* would be nice to find a way to do this directly from a buffer
     * instead of doing two string conversions
     */
    return btoa(str)
  } else {
    return str
  }
}

bytes.native = (_from, encoding) => {
  if (_from instanceof Uint8Array) return _from
  _from = bytes.from(_from, encoding)
  return new Uint8Array(_from.buffer, _from.byteOffset, _from.byteLength)
}

if (process.browser) bytes._randomFill = (...args) => crypto.getRandomValues(...args)

module.exports = bytes


/***/ }),

/***/ 391:
/***/ ((module) => {

"use strict";


const length = (a, b) => {
  if (a.byteLength === b.byteLength) return a.byteLength
  else if (a.byteLength > b.byteLength) return a.byteLength
  return b.byteLength
}

const bytes = (_from, encoding) => bytes.from(_from, encoding)

bytes.sorter = (a, b) => {
  a = bytes(a)
  b = bytes(b)
  const len = length(a, b)
  let i = 0
  while (i < (len - 1)) {
    if (i >= a.byteLength) return 1
    else if (i >= b.byteLength) return -1

    if (a.getUint8(i) < b.getUint8(i)) return -1
    else if (a.getUint8(i) > b.getUint8(i)) return 1
    i++
  }
  return 0
}

bytes.compare = (a, b) => !bytes.sorter(a, b)
bytes.memcopy = (_from, encoding) => {
  const b = bytes(_from, encoding)
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
}
bytes.arrayBuffer = (_from, encoding) => {
  _from = bytes(_from, encoding)
  if (_from.buffer.byteLength === _from.byteLength) return _from.buffer
  return _from.buffer.slice(_from.byteOffset, _from.byteOffset + _from.byteLength)
}
const sliceOptions = (_from, start = 0, end = null) => {
  _from = bytes(_from)
  end = (end === null ? _from.byteLength : end) - start
  return [_from.buffer, _from.byteOffset + start, end]
}
bytes.slice = (_from, start, end) => new DataView(...sliceOptions(_from, start, end))

bytes.memcopySlice = (_from, start, end) => {
  const [buffer, offset, length] = sliceOptions(_from, start, end)
  return buffer.slice(offset, length + offset)
}
bytes.typedArray = (_from, _Class = Uint8Array) => {
  _from = bytes(_from)
  return new _Class(_from.buffer, _from.byteOffset, _from.byteLength / _Class.BYTES_PER_ELEMENT)
}

bytes.concat = (_from) => {
  _from = Array.from(_from)
  _from = _from.map(b => bytes(b))
  const length = _from.reduce((x, y) => x + y.byteLength, 0)
  const ret = new Uint8Array(length)
  let i = 0
  for (const part of _from) {
    const view = bytes.typedArray(part)
    ret.set(view, i)
    i += view.byteLength
  }
  return ret.buffer
}

const maxEntropy = 65536

bytes.random = length => {
  const ab = new ArrayBuffer(length)
  if (length > maxEntropy) {
    let i = 0
    while (i < ab.byteLength) {
      let len
      if (i + maxEntropy > ab.byteLength) len = ab.byteLength - i
      else len = maxEntropy
      const view = new Uint8Array(ab, i, len)
      i += maxEntropy
      bytes._randomFill(view)
    }
  } else {
    const view = new Uint8Array(ab)
    bytes._randomFill(view)
  }
  return ab
}

module.exports = bytes


/***/ }),

/***/ 734:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const crypto = __nccwpck_require__(417)
const fallback = __nccwpck_require__(89).from
const bytes = __nccwpck_require__(391)

bytes.from = (_from, encoding) => {
  if (_from instanceof DataView) return _from
  if (_from instanceof ArrayBuffer) return new DataView(_from)
  if (typeof _from === 'string') {
    _from = Buffer.from(_from, encoding)
  }
  if (Buffer.isBuffer(_from)) {
    return new DataView(_from.buffer, _from.byteOffset, _from.byteLength)
  }
  return fallback(_from, encoding)
}
bytes.toString = (_from, encoding) => {
  _from = bytes(_from)
  return Buffer.from(_from.buffer, _from.byteOffset, _from.byteLength).toString(encoding)
}

bytes.native = (_from, encoding) => {
  if (Buffer.isBuffer(_from)) return _from
  _from = bytes(_from, encoding)
  return Buffer.from(_from.buffer, _from.byteOffset, _from.byteLength)
}

bytes._randomFill = crypto.randomFillSync

module.exports = bytes


/***/ }),

/***/ 684:
/***/ ((module) => {

function Caseless (dict) {
  this.dict = dict || {}
}
Caseless.prototype.set = function (name, value, clobber) {
  if (typeof name === 'object') {
    for (var i in name) {
      this.set(i, name[i], value)
    }
  } else {
    if (typeof clobber === 'undefined') clobber = true
    var has = this.has(name)

    if (!clobber && has) this.dict[has] = this.dict[has] + ',' + value
    else this.dict[has || name] = value
    return has
  }
}
Caseless.prototype.has = function (name) {
  var keys = Object.keys(this.dict)
    , name = name.toLowerCase()
    ;
  for (var i=0;i<keys.length;i++) {
    if (keys[i].toLowerCase() === name) return keys[i]
  }
  return false
}
Caseless.prototype.get = function (name) {
  name = name.toLowerCase()
  var result, _key
  var headers = this.dict
  Object.keys(headers).forEach(function (key) {
    _key = key.toLowerCase()
    if (name === _key) result = headers[key]
  })
  return result
}
Caseless.prototype.swap = function (name) {
  var has = this.has(name)
  if (has === name) return
  if (!has) throw new Error('There is no header than matches "'+name+'"')
  this.dict[name] = this.dict[has]
  delete this.dict[has]
}
Caseless.prototype.del = function (name) {
  var has = this.has(name)
  return delete this.dict[has || name]
}

module.exports = function (dict) {return new Caseless(dict)}
module.exports.httpify = function (resp, headers) {
  var c = new Caseless(headers)
  resp.setHeader = function (key, value, clobber) {
    if (typeof value === 'undefined') return
    return c.set(key, value, clobber)
  }
  resp.hasHeader = function (key) {
    return c.has(key)
  }
  resp.getHeader = function (key) {
    return c.get(key)
  }
  resp.removeHeader = function (key) {
    return c.del(key)
  }
  resp.headers = c.dict
  return c
}


/***/ }),

/***/ 716:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 417:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 605:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 211:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 835:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(186);
const github = __nccwpck_require__(716);

const getTicketKeys = __nccwpck_require__(885);
const getWabbiGatePass = __nccwpck_require__(885);

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
		github.context.payload.number,
		github.context.payload.pull_request
	)
);

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map