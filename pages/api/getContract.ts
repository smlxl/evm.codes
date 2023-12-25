import { NextApiResponse, NextApiRequest } from 'next'
// import { serialize } from 'next-mdx-remote/serialize'
import { Address, BN, bufferToHex } from 'ethereumjs-util'
import { etherscan_getsource } from '../../util/etherscan'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    if (req.method !== 'GET') {
        res.status(405)
    }

    let addr = req.query?.addr as string
    let ethscan_resp = await etherscan_getsource(addr)
    let data = await ethscan_resp.json()
    res.status(200).json(data)
}
