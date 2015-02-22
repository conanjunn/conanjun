var http = require('http');
var fs = require('fs');
var url = require('url');

var server = http.createServer().listen(3000);

console.log('server start on port 3000');

server.on('request', function(request, response) {

	var oUrl = url.parse(request.url);

	if (request.method.toLowerCase() === 'get') {

		response.writeHead(200, {
			'Content-Type': 'text/html'
		});

		fs.readFile('./view/html.html', {
			encoding: 'utf-8'
		}, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				response.end(data);
			}
		});

	} else if (request.method.toLowerCase() === 'post') {

		response.writeHead(200, {
			'Content-Type': 'text/html'
		});

		var info = '';

		request.on('data', function(chunk) {
			info += chunk;
		}).on('end', function() {
			console.log(info);
		});

		fs.readFile('./view/post.html', {
			encoding: 'utf-8'
		}, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				response.end(data);
			}
		});
	}

});