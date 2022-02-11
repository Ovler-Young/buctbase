import countapi from 'countapi-js'
import provideBadge from '../../utils/provide-badge'

//import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: { query: { id: string; }; }, res:  { query: { id: string; }; }) => {
  if (!req.query.id) {
    return provideBadge(res, 'error', 'No id provided', 'critical')
  }

  const { value } = await countapi.hit('hitsbadge', req.query.id) 
  '以后加个前缀buctbase'

  provideBadge(res, 'vivitors', value, 'brightgreen')
};