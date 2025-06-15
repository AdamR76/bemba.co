import { html } from "../std.mjs";

const drawMetrics = project => {
	const completed = project.filter(task => task.phaseid === 4).length;
	const projectItems = project.length,
		percentComplete = `${Math.round(parseFloat(completed / (projectItems || 1)) * 100)}%`;
	return html('div', { className: 'metrics' }, [
		html('p', {}, html('strong', {}, ['Progress: ', `${completed}/${projectItems} ${percentComplete}`])),
	])
};

export {
	drawMetrics
}
