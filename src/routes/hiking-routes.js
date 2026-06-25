import { Hono } from 'hono';
import Route from '../../models/Route.js';
import { render } from '../lib/render.js';
import { usuarioLoggeado } from '../middleware/auth.js';

const hikingRoutes = new Hono();

hikingRoutes.get('/allRoutes', async (c) => {
  const allRoutes = await Route.find({}).populate('owner');
  return render(c, 'createdRoutes/allRoutes', { data: allRoutes });
});

hikingRoutes.get('/:routeID', async (c) => {
  const routeID = c.req.param('routeID');
  const currentUser = c.get('currentUser');
  const singleRoute = await Route.findById(routeID).populate('owner');

  const data = { getSingleRoute: singleRoute };
  if (currentUser && currentUser.username === singleRoute.postedBy) {
    data.creado = true;
  }
  return render(c, 'createdRoutes/singleRoute', { data });
});

hikingRoutes.get('/:routeID/editMyRoute', usuarioLoggeado, async (c) => {
  const routeID = c.req.param('routeID');
  const foundRoute = await Route.findById(routeID);
  return render(c, 'createdRoutes/editMyRoute', { data: foundRoute });
});

hikingRoutes.post('/:routeID/editMyRoute', usuarioLoggeado, async (c) => {
  const routeID = c.req.param('routeID');
  const body = await c.req.parseBody();
  const updatedRoute = await Route.findByIdAndUpdate(routeID, {
    title: body.title,
    state: body.state,
    town: body.town,
    altitude: body.altitude,
    lodging: body.lodging,
    magicTown: body.magicTown,
    hardness: body.hardness,
    description: body.description,
    imgUrl: body.imgUrl,
  }, { new: true });
  return c.redirect(`/createdRoutes/${updatedRoute._id}`);
});

hikingRoutes.post('/:routeID/deleteRoute', usuarioLoggeado, async (c) => {
  const routeID = c.req.param('routeID');
  await Route.findByIdAndDelete(routeID);
  return c.redirect('/createdRoutes/allRoutes');
});

export default hikingRoutes;
