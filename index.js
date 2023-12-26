const Docker = require('dockerode');

async function listContainers() {
	const docker = new Docker();

	try {
		const containers = await docker.listContainers({ all: true });

		const containerList = containers.map((container) => ({
			name: container.Names[0].replace('/', ''),
			id: container.Id,
			image: container.Image,
			status: container.Status,
			ports: container.Ports,
		}));

		return containerList;
	} catch (error) {
		return { error: 'Erreur lors de la récupération de la liste des conteneurs' };
	}
}

listContainers()
	.then((containerList) => {
		console.log(JSON.stringify(containerList, null, 2));
	})
	.catch((error) => {
		console.error(error);
	});
