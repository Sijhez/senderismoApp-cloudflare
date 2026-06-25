import { Hono } from 'hono';
import User from '../../models/User.js';
import Perfil from '../../models/Perfil.js';
import Route from '../../models/Route.js';
import { render } from '../lib/render.js';
import { usuarioLoggeado } from '../middleware/auth.js';

const users = new Hono();

users.get('/profile', async (c) => {
  const currentUser = c.get('currentUser');
  if (!currentUser) return c.redirect('/login');
  const idUsuario = currentUser._id;
  const profileCreate = await Perfil.findOne({ idUsuario });
  return render(c, 'users/profile', { data: profileCreate });
});

users.get('/create', usuarioLoggeado, async (c) => {
  const currentUser = c.get('currentUser');
  const user = await Perfil.findById(currentUser._id).catch(() => null);
  return render(c, 'users/create', { data: user });
});

users.post('/create', usuarioLoggeado, async (c) => {
  const currentUser = c.get('currentUser');
  const body = await c.req.parseBody();
  await Perfil.create({
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    nombre: body.nombre,
    apellido: body.apellido,
    usuario: body.usuario,
    edad: body.edad,
    pais: body.pais,
    nivel: body.nivel,
    idUsuario: currentUser._id,
  });
  return c.redirect('/users/profile');
});

users.get('/:profileID/edit', async (c) => {
  const profileID = c.req.param('profileID');
  const foundProfile = await Perfil.findById(profileID);
  return render(c, 'users/edit', { data: foundProfile });
});

users.post('/:profileID/edit', usuarioLoggeado, async (c) => {
  const currentUser = c.get('currentUser');
  const profileID = c.req.param('profileID');
  const body = await c.req.parseBody();
  await Perfil.findByIdAndUpdate(profileID, {
    photo: body.photo,
    nombre: body.nombre,
    apellido: body.apellido,
    usuario: body.usuario,
    edad: body.edad,
    pais: body.pais,
    nivel: body.nivel,
    idUsuario: currentUser._id,
  }, { new: true });
  return c.redirect('/users/profile');
});

users.post('/:profileID/delete', usuarioLoggeado, async (c) => {
  const profileID = c.req.param('profileID');
  await Perfil.findByIdAndDelete(profileID);
  return c.redirect('/users/profile');
});

users.get('/myRoute', usuarioLoggeado, async (c) => {
  return render(c, 'users/myRoute');
});

users.post('/myRoute', usuarioLoggeado, async (c) => {
  const currentUser = c.get('currentUser');
  const body = await c.req.parseBody();
  try {
    const newRoute = await Route.create({
      title: body.title,
      state: body.state,
      town: body.town,
      altitude: body.altitude,
      lodging: body.lodging,
      magicTown: body.magicTown,
      hardness: body.hardness,
      description: body.description,
      imgUrl1: body.imgUrl1,
      imgUrl2: body.imgUrl2,
      imgUrl3: body.imgUrl3,
      imgUrl4: body.imgUrl4,
      imgUrl5: body.imgUrl5,
      imgUrl6: body.imgUrl6,
      postedBy: currentUser.username,
      owner: currentUser._id,
    });
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { myPosts: newRoute._id },
    });
    return c.redirect('/createdRoutes/allRoutes');
  } catch (error) {
    console.log(error);
    c.status(500);
    return render(c, 'users/myRoute');
  }
});

export default users;
