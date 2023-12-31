const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const port = 3000;

const fetchStatus = async (name, port) => {
	try {
		const response = await fetch(`http://172.24.0.1:${port}/status`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: 'status',
			}),
		});

		return response.ok ? 'OK' : 'ERROR';
	} catch (error) {
		return 'ERROR';
	}
};

async function getStatus() {
	try {
		const fileContent = await fs.readFile('info.json', 'utf-8');
		const info = JSON.parse(fileContent);

		const containerList = await Promise.all(
			Object.entries(info).map(async ([name, port]) => {
				const status = await fetchStatus(name, port);

				return {
					name: name,
					ports: port,
					status: status,
				};
			})
		);

		return containerList;
	} catch (error) {
		console.error('Error reading or parsing info.json:', error.message);
	}
}

async function getLast(category) {
	try {
		const fileContent = await fs.readFile('info.json', 'utf-8');
		const info = JSON.parse(fileContent);

		const containersInCategory = Object.entries(info)
			.filter(([name]) => name.startsWith(category))
			.map(([name, port]) => ({ name, port }));

		const lastContainer = containersInCategory.sort((a, b) => a.name.localeCompare(b.name)).pop();

		if (lastContainer) {
			return lastContainer.port;
		} else {
			throw new Error(`No container found in the category: ${category}`);
		}
	} catch (error) {
		console.error('Error reading or parsing info.json:', error.message);
		throw error;
	}
}

async function getInfo() {
	try {
		const fileContent = await fs.readFile('info.json', 'utf-8');
		const info = JSON.parse(fileContent);

		const categoryCount = {};

		Object.keys(info).forEach((name) => {
			const category = name.split('-')[0];
			categoryCount[category] = (categoryCount[category] || 0) + 1;
		});

		const totalContainers = Object.values(categoryCount).reduce((total, count) => total + count, 0);

		return {
			categoryCount,
			totalContainers,
		};
	} catch (error) {
		console.error('Error reading or parsing info.json:', error.message);
		throw error;
	}
}

async function getPort(name) {
	try {
		const fileContent = await fs.readFile('info.json', 'utf-8');
		const info = JSON.parse(fileContent);
		const port = info[name];

		return {
			port,
		};
	} catch (error) {
		console.error('Error reading or parsing info.json:', error.message);
		throw error;
	}
}

app.use(express.json());
app.use(cors());

app.post('/status', (req, res) => {
	const token = req.body.token;
	console.log(token);

	getStatus()
		.then((containerList) => {
			res.json(containerList);
		})
		.catch((error) => {
			res.sendStatus(404);
			res.send(error);
		});
});

app.post('/last', (req, res) => {
	const token = req.body.token;
	console.log(token);

	if (req.body.category) {
		getLast(req.body.category)
			.then((last) => {
				res.json(last);
			})
			.catch((error) => {
				res.sendStatus(404);
				res.send(error);
			});
	} else {
		res.send('Undefined category');
	}
});

app.post('/info', (req, res) => {
	const token = req.body.token;
	console.log(token);

	getInfo()
		.then((info) => {
			res.json(info);
		})
		.catch((error) => {
			res.sendStatus(404);
			res.send(error);
		});
});

app.post('/port', (req, res) => {
	const token = req.body.token;
	console.log(token);

	if (req.body.name) {
		getPort(req.body.name)
			.then((port) => {
				res.json(port);
			})
			.catch((error) => {
				res.sendStatus(404);
				res.send(error);
			});
	} else {
		res.send('Undefined name');
	}
});

app.listen(port, () => console.log(`The SYS-Docker server runs on port ${port}`));
