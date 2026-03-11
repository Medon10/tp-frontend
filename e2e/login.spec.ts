import { test, expect } from '@playwright/test';

const validUser = {
  id: 123,
  nombre: 'Test',
  apellido: 'User',
  email: 'test@vacationmatch.com',
  telefono: '3420000000',
  fechaNacimiento: '2000-01-01',
  direccion: 'Santa Fe',
  role: 'cliente',
  dni: '40111222',
};

test.describe('Login flow', () => {
  test('permite login exitoso y redirige luego de enviar formulario', async ({ page }) => {
    // Estado inicial no autenticado para evitar redirecciones automáticas.
    await page.route('**/api/users/profile/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No autenticado' }),
      });
    });

    // Mock de login exitoso.
    await page.route('**/api/users/login', async (route) => {
      const body = route.request().postDataJSON() as { email?: string; password?: string };
      expect(body.email).toBe('test@vacationmatch.com');
      expect(body.password).toBe('Pass1234');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: validUser,
          token: 'fake-jwt-token',
        }),
      });
    });

    await page.goto('/login');

    // Verifica render inicial: titulo, formulario y campos.
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Tu contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();

    await page.getByPlaceholder('tu@email.com').fill('test@vacationmatch.com');
    await page.getByPlaceholder('Tu contraseña').fill('Pass1234');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    // En este proyecto el default post-login actual es /perfil (no /).
    // Aceptamos ambos para cubrir variantes de flujo.
    await expect(page).toHaveURL(/\/(perfil)?$/);
  });

  test('muestra mensaje de error con credenciales invalidas', async ({ page }) => {
    await page.route('**/api/users/profile/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No autenticado' }),
      });
    });

    await page.route('**/api/users/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciales inválidas' }),
      });
    });

    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();

    await page.getByPlaceholder('tu@email.com').fill('wrong@vacationmatch.com');
    await page.getByPlaceholder('Tu contraseña').fill('incorrecta');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByText('Email o contraseña incorrectos.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
