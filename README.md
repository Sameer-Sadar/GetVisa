# GetVisa — applicant app

Expo (React Native) client for applicants. It talks to the Express API in `../api`.

## Run

```sh
cd api
npm run dev
```

```sh
cd client
npm install
npx expo start
```

Demo account: `demo@visa.app` / `Password123`

On a physical phone, keep this PC and the phone on the **same Wi‑Fi**, keep `npm run dev` running in `api`, then scan the Expo QR code. The app uses this PC’s LAN IP automatically (the same one as `exp://192.168.x.x:8081`). If Windows Firewall prompts, allow Node.js on private networks.

Staff use the admin portal in `../admin`, not this app.
