# BRENO

Panel de operaciones para agencias de desarrollo: clientes, proyectos, reuniones, ingresos y un agente de prospección de demostración.

## Estado

El registro, el inicio de sesión, la verificación de correo y la recuperación de contraseña usan Supabase Auth. Los espacios de trabajo se guardan por cuenta en Supabase con RLS. Los datos iniciales son ejemplos editables; el agente de prospección sigue usando prospectos simulados.

## Desarrollo local

Requiere Node.js 22 y pnpm 11.

```bash
pnpm install
pnpm dev
```

Para activar autenticación en otro entorno, copia `.env.example` a `.env.local` y completa las variables del proyecto Supabase. Sin configuración, BRENO abre en modo demo local. La migración de la tabla segura está en `supabase/migrations`.

## Configurar registro por correo

1. Crea un proyecto en Supabase y copia la URL del proyecto y su publishable/anon key.
2. Configura las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local`.
3. Configura el proveedor SMTP de Supabase para entregar confirmaciones y recuperaciones a cualquier dirección. El servidor SMTP compartido de Supabase sirve para pruebas y limita los destinatarios; no es adecuado para producción.
4. En Supabase Auth → URL Configuration, define como `Site URL` la URL publicada de BRENO y agrega como redirect permitido `http://localhost:5173/auth/callback` y la URL publicada terminada en `/auth/callback`.
5. Usa las plantillas de correo de Supabase para personalizar confirmación y recuperación.

La interfaz no incluye una clave de servicio ni guarda contraseñas. La clave publishable/anon se usa en el navegador; las políticas de acceso y los datos privados deben protegerse del lado de Supabase.

## Publicar en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila y publica el sitio automáticamente al enviar cambios a `main` o `master`.

En el repo GitHub, configura:

- Variable de Actions `VITE_SUPABASE_URL`.
- Variable de Actions `VITE_SUPABASE_ANON_KEY` (es una clave publicable; nunca uses la clave `service_role`).
- En Settings → Pages, selecciona GitHub Actions como fuente de despliegue.

El build adapta automáticamente la base de URL al nombre del repo y publica `404.html` para mantener las rutas de React Router al recargar una página.

## Colaborar

BRENO se publica bajo licencia MIT. Se aceptan issues y pull requests con mejoras, correcciones y módulos nuevos. No incluyas claves, tokens ni datos reales de clientes en commits.

## Comandos

```bash
pnpm dev
pnpm build
pnpm preview
```

Stack: React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Supabase Auth, react-big-calendar y gantt-task-react.
