const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const port = 3000;

const fetchStatus = async (name, port) => {
	try {
		const response = await fetch(`http://localhost:${port}`, {
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

app.use(express.json());
app.use(cors());

app.post('', (req, res) => {
	const token = req.body.token;
	console.log(token);

	console.log(req.body);

	getStatus()
		.then((containerList) => {
			res.json(containerList);
		})
		.catch((error) => {
			res.sendStatus(404);
			res.send(error);
		});
});

app.listen(port, () => console.log(`The SYS-Docker server runs on port ${port}`));
