import { Hono } from 'hono';
import { ObjectId } from '../models.js';
import { render } from '../lib/render.js';
import { usuarioLoggeado } from '../middleware/auth.js';

const users = new Hono();

users.get('/profile', async (c) => {
  const currentUser = c.get('currentUser');
  if (!currentUser) return c.redirect('/login');
  const db = c.get('db');
  const profile = await db.collection('perfils').findOne({ idUsuario: currentUser._id });
  return render(c, 'users/profile', { data: profile });
});

users.get('/create', usuarioLoggeado, async (c) => {
  return render(c, 'users/create', { data: null });
});

users.post('/create', usuarioLoggeado, async (c) => {
  const currentUser = c.get('currentUser');
  const body = await c.req.parseBody();
  const db = c.get('db');
  await db.collection('perfils').insertOne({
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    nombre: body.nombre,
    apellido: body.apellido,
    usuario: body.usuario,
    edad: Number(body.edad),
    pais: body.pais,
    nivel: body.nivel,
    idUsuario: currentUser._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return c.redirect('/users/profile');
});

users.get('/:profileID/edit', async (c) => {
  const db = c.get('db');
  const profileID = c.req.param('profileID');
  const foundProfile = await db.collection('perfils').findOne({ _id: new ObjectId(profileID) });
  return render(c, 'users/edit', { data: foundProfile });
});

users.post('/:profileID/edit', usuarioLoggeado, async (c) => {
  const currentUser = c.get('currentUser');
  const db = c.get('db');
  const profileID = c.req.param('profileID');
  const body = await c.req.parseBody();
  await db.collection('perfils').findOneAndUpdate(
    { _id: new ObjectId(profileID) },
    { $set: {
      photo: body.photo,
      nombre: body.nombre,
      apellido: body.apellido,
      usuario: body.usuario,
      edad: Number(body.edad),
      pais: body.pais,
      nivel: body.nivel,
      idUsuario: currentUser._id,
      updatedAt: new Date(),
    }},
    { returnDocument: 'after' }
  );
  return c.redirect('/users/profile');
});

users.post('/:profileID/delete', usuarioLoggeado, async (c) => {
  const db = c.get('db');
  const profileID = c.req.param('profileID');
  await db.collection('perfils').deleteOne({ _id: new ObjectId(profileID) });
  return c.redirect('/users/profile');
});

users.get('/myRoute', usuarioLoggeado, async (c) => {
  return render(c, 'users/myRoute');
});

users.post('/myRoute', usuarioLoggeado, async (c) => {
  const currentUser = c.get('currentUser');
  const db = c.get('db');
  const body = await c.req.parseBody();
  try {
    const result = await db.collection('routes').insertOne({
      title: body.title,
      state: body.state,
      town: body.town,
      altitude: Number(body.altitude),
      lodging: body.lodging,
      magicTown: body.magicTown,
      hardness: Number(body.hardness),
      description: body.description,
      imgUrl1: body.imgUrl1,
      imgUrl2: body.imgUrl2,
      imgUrl3: body.imgUrl3,
      imgUrl4: body.imgUrl4,
      imgUrl5: body.imgUrl5,
      imgUrl6: body.imgUrl6,
      postedBy: currentUser.username,
      owner: new ObjectId(currentUser._id),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await db.collection('users').updateOne(
      { _id: new ObjectId(currentUser._id) },
      { $push: { myPosts: result.insertedId } }
    );
    return c.redirect('/createdRoutes/allRoutes');
  } catch (error) {
    console.log(error);
    return render(c, 'users/myRoute', {}, 500);
  }
});

export default users;
