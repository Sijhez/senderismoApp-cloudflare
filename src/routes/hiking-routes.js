import { Hono } from 'hono';
import { ObjectId } from '../models.js';
import { render } from '../lib/render.js';
import { usuarioLoggeado } from '../middleware/auth.js';

const hikingRoutes = new Hono();

const populateOwnerPipeline = [
  { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: '_owner' } },
  { $addFields: { owner: { $arrayElemAt: ['$_owner', 0] } } },
  { $project: { _owner: 0 } },
];

hikingRoutes.get('/allRoutes', async (c) => {
  const db = c.get('db');
  const allRoutes = await db.collection('routes').aggregate([
    ...populateOwnerPipeline,
  ]).toArray();
  return render(c, 'createdRoutes/allRoutes', { data: allRoutes });
});

hikingRoutes.get('/:routeID', async (c) => {
  const db = c.get('db');
  const routeID = c.req.param('routeID');
  const currentUser = c.get('currentUser');

  const results = await db.collection('routes').aggregate([
    { $match: { _id: new ObjectId(routeID) } },
    ...populateOwnerPipeline,
  ]).toArray();
  const singleRoute = results[0];

  const data = { getSingleRoute: singleRoute };
  if (currentUser && currentUser.username === singleRoute.postedBy) {
    data.creado = true;
  }
  return render(c, 'createdRoutes/singleRoute', { data });
});

hikingRoutes.get('/:routeID/editMyRoute', usuarioLoggeado, async (c) => {
  const db = c.get('db');
  const routeID = c.req.param('routeID');
  const foundRoute = await db.collection('routes').findOne({ _id: new ObjectId(routeID) });
  return render(c, 'createdRoutes/editMyRoute', { data: foundRoute });
});

hikingRoutes.post('/:routeID/editMyRoute', usuarioLoggeado, async (c) => {
  const db = c.get('db');
  const routeID = c.req.param('routeID');
  const body = await c.req.parseBody();
  await db.collection('routes').findOneAndUpdate(
    { _id: new ObjectId(routeID) },
    { $set: {
      title: body.title,
      state: body.state,
      town: body.town,
      altitude: Number(body.altitude),
      lodging: body.lodging,
      magicTown: body.magicTown,
      hardness: Number(body.hardness),
      description: body.description,
      imgUrl: body.imgUrl,
      updatedAt: new Date(),
    }},
    { returnDocument: 'after' }
  );
  return c.redirect(`/createdRoutes/${routeID}`);
});

hikingRoutes.post('/:routeID/deleteRoute', usuarioLoggeado, async (c) => {
  const db = c.get('db');
  const routeID = c.req.param('routeID');
  await db.collection('routes').deleteOne({ _id: new ObjectId(routeID) });
  return c.redirect('/createdRoutes/allRoutes');
});

export default hikingRoutes;
