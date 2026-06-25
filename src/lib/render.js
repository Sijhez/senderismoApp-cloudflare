import templates from '../templates.js';

export function render(c, templateName, data, status) {
  const currentUser = c.get('currentUser');
  const viewData = { ...data, currentUser };
  const body = templates[templateName](viewData);
  const html = templates['layout']({ ...viewData, body });
  if (status) c.status(status);
  return c.html(html);
}
