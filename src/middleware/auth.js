export function usuarioLoggeado(c, next) {
  if (!c.get('currentUser')) {
    return c.redirect('/login');
  }
  return next();
}

export function usuarioNoLoggeado(c, next) {
  if (c.get('currentUser')) {
    return c.redirect('/');
  }
  return next();
}
