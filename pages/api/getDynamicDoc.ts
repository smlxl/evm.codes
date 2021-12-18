import { NextApiResponse, NextApiRequest } from 'next'
import { serialize } from 'next-mdx-remote/serialize'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { body } = req
    res.status(200).json({ mdx: await serialize(body.content) })
  } else {
    res.status(405)
  }
}
