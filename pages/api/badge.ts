import countapi from 'countapi-js'
import provideBadge from '../../utils/provide-badge'

export default async (req, res) => {
  if (!req.query.id) {
    return provideBadge(res, 'error', 'No id provided', 'critical')
  }

  const { value } = await countapi.hit('hitsbadge', req.query.id) 
  '以后加个前缀buctbase'

  provideBadge(res, 'vivitors', value, 'brightgreen')
};