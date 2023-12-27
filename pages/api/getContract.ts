import { NextApiResponse, NextApiRequest } from 'next'
import { etherscanGetSource } from '../../util/EtherscanApi'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    if (req.method !== 'GET') {
        res.status(405)
    }

    let addr = req.query?.address as string
    let ethscan_resp = await etherscanGetSource(addr)
    let data = await ethscan_resp.json()
    res.status(200).json(data)
}
