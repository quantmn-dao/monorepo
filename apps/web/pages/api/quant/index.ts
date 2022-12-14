import { startCase } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { format } from 'date-fns';

import dbConnect from '../../../utils/dbConnect';
import Quant from '../../../models/Quant';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method } = req;

  await dbConnect();
  
  switch (method) {
    case 'DELETE':
      try {
        console.log('delete');
        const quant = await Quant.deleteOne({ _id: body.id });
        console.log({ quant });
        if (!quant) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: quant });
      } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case 'POST':
      try {
        console.log('trying')
        let { name, date, user} = body
        console.log({date})
        name = startCase(name)
        const final_date = date ? date : new Date()
        const quant = await Quant.create({
          ...body,
          name,
          status: 1,
          created_at: new Date(),
          date: final_date.setHours(3, 0, 0, 0),
        });
        console.log({quant})


        return res.status(200).json({ success: true, message: 'Success', data: quant });
      } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }

}
