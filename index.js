const Docker = require('dockerode');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

async function listContainers() {
	const docker = new Docker();

	try {
		const containers = await docker.listContainers({ all: true });

		const containerList = containers.map((container) => ({
			name: container.Names[0].replace('/', ''),
			id: container.Id.substring(0, 8),
			image: container.Image,
			status: container.Status,
			ports: container.Ports,
		}));

		return containerList;
	} catch (error) {
		return { error: 'Erreur lors de la récupération de la liste des conteneurs' };
	}
}

app.use(express.json());
app.use(cors());

app.post('', (req, res) => {
	const token = req.body.token;
	console.log(token);

	console.log(req.body);

	listContainers()
		.then((containerList) => {
			res.json(containerList);
		})
		.catch((error) => {
			res.sendStatus(404);
			res.send(error);
		});
});

app.listen(port, () => console.log(`The SYS-Docker server runs on port ${port}`));
