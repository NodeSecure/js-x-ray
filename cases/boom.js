const { request } = require('https');
const { globalAgent } = require('http');
const { parse, resolve } = require('url');

function toError(rej, res, err) {
	err = err || new Error(res.statusMessage);
	err.statusMessage = res.statusMessage;
	err.statusCode = res.statusCode;
	err.headers = res.headers;
	err.data = res.data;
	rej(err);
}

function send(method, uri, opts={}) {
	return new Promise((res, rej) => {
		let req, tmp, out = '';
		let { redirect=true } = opts;
		opts.method = method;

		if (uri && !!uri.toJSON) uri = uri.toJSON();
		Object.assign(opts, typeof uri === 'string' ? parse(uri) : uri);
		opts.agent = opts.protocol === 'http:' ? globalAgent : void 0;

		req = request(opts, rr => {
			if (rr.statusCode > 300 && redirect && rr.headers.location) {
				opts.path = resolve(opts.path, rr.headers.location);
				return send(method, opts.path.startsWith('/') ? opts : opts.path, opts).then(res, rej);
			}

			rr.on('data', d => {
				out += d;
			});

			rr.on('end', () => {
				tmp = rr.headers['content-type'];
				if (tmp && out && tmp.includes('application/json')) {
					try {
						out = JSON.parse(out, opts.reviver);
					} catch (err) {
						return toError(rej, rr, err);
					}
				}
				rr.data = out;
				if (rr.statusCode >= 400) {
					toError(rej, rr);
				} else {
					res(rr);
				}
			});
		});

		req.on('timeout', req.abort);
		req.on('error', err => {
			// Node 11.x ~> boolean, else timestamp
			err.timeout = req.aborted;
			rej(err);
		});

		if (opts.body) {
			tmp = typeof opts.body === 'object' && !Buffer.isBuffer(opts.body);
			tmp && req.setHeader('content-type', 'application/json');
			tmp = tmp ? JSON.stringify(opts.body) : opts.body;

			req.setHeader('content-length', Buffer.byteLength(tmp));
			req.write(tmp);
		}

		req.end();
	});
}

const get = send.bind(send, 'GET');
const post = send.bind(send, 'POST');
const patch = send.bind(send, 'PATCH');
const del = send.bind(send, 'DELETE');
const put = send.bind(send, 'PUT');

exports.del = del;
exports.get = get;
exports.patch = patch;
exports.post = post;
exports.put = put;
exports.send = send;
