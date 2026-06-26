import { Hono } from 'hono';
import bcryptjs from 'bcryptjs';
import { ObjectId } from '../models.js';
import { render } from '../lib/render.js';
import { setSession, destroySession } from '../lib/session.js';
import { usuarioLoggeado, usuarioNoLoggeado } from '../middleware/auth.js';

const auth = new Hono();

auth.get('/', async (c) => {
  return render(c, 'home');
});

auth.get('/signup', usuarioNoLoggeado, async (c) => {
  return render(c, 'signup');
});

auth.post('/signup', usuarioNoLoggeado, async (c) => {
  const body = await c.req.parseBody();
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return render(c, 'signup', {
      errorMessage: 'Uno o más campos están vacíos. Revísalos nuevamente.',
    });
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    return render(c, 'signup', {
      errorMessage: 'Tu password debe de contener 6 caracteres, mínimo un número y una mayúscula.',
    });
  }

  try {
    const db = c.get('db');
    const salt = await bcryptjs.genSalt(10);
    const passwordEncriptado = await bcryptjs.hash(password, salt);
    await db.collection('users').insertOne({ username, email: email.toLowerCase().trim(), passwordEncriptado, myPosts: [] });
    return c.redirect('/login');
  } catch (error) {
    console.log(error);
    return render(c, 'signup', {
      errorMessage: 'Hubo un error con la validez de tu correo. Intenta nuevamente. No dejes espacios y usa minúsculas.',
    }, 500);
  }
});

auth.get('/login', usuarioNoLoggeado, async (c) => {
  return render(c, 'login');
});

auth.post('/login', usuarioNoLoggeado, async (c) => {
  try {
    const db = c.get('db');
    const body = await c.req.parseBody();
    const { email, password } = body;
    const foundUser = await db.collection('users').findOne({ email: email.toLowerCase().trim() });

    if (!foundUser) {
      return render(c, 'login', {
        errorMessage: 'Email o contraseña sin coincidencia.',
      });
    }

    const verifiedPass = bcryptjs.compareSync(password, foundUser.passwordEncriptado);
    if (!verifiedPass) {
      return render(c, 'login', {
        errorMessage: 'Email o contraseña errónea. Intenta nuevamente.',
      });
    }

    await setSession(c, {
      _id: foundUser._id.toString(),
      username: foundUser.username,
      email: foundUser.email,
    });

    return c.redirect('/users/profile');
  } catch (error) {
    console.log(error);
    return render(c, 'login', {
      errorMessage: 'Error al iniciar sesión. Intenta nuevamente.',
    }, 500);
  }
});

auth.get('/logout', usuarioLoggeado, async (c) => {
  destroySession(c);
  return c.redirect('/');
});

export default auth;
