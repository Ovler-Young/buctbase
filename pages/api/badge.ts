import countapi from 'countapi-js'
import provideBadge from '../../utils/provide-badge'

async function badage(req: { query: { id: string; }; }, res: { query: { id: string; }; }) {
  if (!req.query.id) {
    return provideBadge(res, 'error', 'No id provided', 'critical');
  }

  const { value } = await countapi.hit('hitsbadge', req.query.id);

  provideBadge(res, 'vivitors', value, 'brightgreen');
}

export default badage;