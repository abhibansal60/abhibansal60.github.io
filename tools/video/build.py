"""Writes video.html: a 1920x1080 page whose render(t) draws the career film at time t (seconds)."""
import json, pathlib

REPO = pathlib.Path(__file__).resolve().parents[2]
FONTS = REPO / 'node_modules/@fontsource/schibsted-grotesk/files'
d = json.loads((REPO / 'src/data/resume.json').read_text())

# Two lines per era, picked for the strongest facts; indexes into each era's log.
picks = {'bootstrap': [1, 0], 'build': [0, 2], 'test': [0, 2], 'modernize': [1, 2], 'release': [1, 2]}
eras = [{'year': t['year'], 'stage': t['stage'], 'name': t['name'],
         'lines': [t['log'][i] for i in picks.get(t['stage'], [0, 1])]} for t in d['timeline']]
eras.append({'year': 'now', 'stage': 'next', 'name': 'In progress',
             'lines': ['Building agents that ship safely inside a regulated enterprise',
                       'Leaving a cookie-cutter tool behind every fix']})
data = {'eras': eras, 'figures': d['figures'], 'label': d['basics']['label'], 'name': d['basics']['name']}

html = (pathlib.Path(__file__).parent / 'template.html').read_text()
html = html.replace('__FONTS__', FONTS.as_uri()).replace('__DATA__', json.dumps(data))
(pathlib.Path(__file__).parent / 'video.html').write_text(html)
print(f"{len(eras)} eras written")
