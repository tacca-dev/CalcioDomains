# Mock Authentication Mode per Builder.io Preview

Questa funzionalità permette di visualizzare tutte le pagine dell'applicazione (incluse quelle protette) senza autenticazione Auth0, utile per il preview di Builder.io.

## Come Attivare

### Opzione 1: File .env.local (Consigliato per sviluppo locale)

1. Crea un file `.env.local` nella root del progetto:
   ```bash
   cp .env.local.example .env.local
   ```

2. Il file conterrà:
   ```env
   VITE_MOCK_AUTH=true
   ```

3. Riavvia il server di sviluppo:
   ```bash
   npm run dev
   ```

### Opzione 2: Modifica .env (Per deploy temporaneo)

1. Apri `.env` e cambia:
   ```env
   VITE_MOCK_AUTH=true
   ```

2. **IMPORTANTE**: Ricordati di riportarlo a `false` prima del commit!

## Cosa Fa

Quando `VITE_MOCK_AUTH=true`:

- **Autenticazione**: Bypass completo di Auth0
- **User Mock**: Ritorna un utente admin con dati fittizi
- **Dati Mock**: Tutte le dashboard mostrano dati di esempio
- **Pagine Accessibili**: Dashboard, Admin Panel, Profile funzionano senza login

### Dati Mock Inclusi

**User:**
- Nome: Dev User
- Email: dev@calciodomains.local
- Nickname: devuser
- Credits: 100€
- Admin: true

**Dashboard:**
- 2 domini: esempio.calcio (premium), test.football (standard)
- 2 coupon: SUMMER2024 (20%), WELCOME10 (10%)
- Totale speso: 25€

**Admin Panel:**
- 2 utenti (devuser, testuser)
- 2 domini venduti
- 3 coupon (2 available, 1 used)
- 3 livelli pricing
- 1 prompt di sistema

## Quando Usare

✅ **SI - Usare per:**
- Preview di Builder.io su localhost
- Test rapidi dell'UI senza login
- Design e sviluppo frontend

❌ **NO - Non usare per:**
- Production
- Test di funzionalità backend
- Test di integrazione Auth0
- Commit su git (ricorda di riportare a false!)

## Note Tecniche

- La variabile viene letta da `import.meta.env.VITE_MOCK_AUTH`
- Il check avviene in: useUser.js, App.vue, NavBar.vue, ProfileView, DashboardView, AdminDashboardView
- Tutte le chiamate Auth0 vengono bypassate
- I dati mock sono hardcoded nei componenti
- Console log: `🔧 MOCK AUTH MODE: ...` quando attivo

## Disattivazione

Per disattivare:

1. **Se usi .env.local**: Elimina il file o imposta `VITE_MOCK_AUTH=false`
2. **Se hai modificato .env**: Riporta `VITE_MOCK_AUTH=false`
3. Riavvia il server: `npm run dev`

## File .env.local

Il file `.env.local` viene automaticamente ignorato da git (tramite `.gitignore`), quindi puoi mantenerlo attivo localmente senza rischio di commit accidentali.

Se non esiste un `.gitignore`, assicurati che contenga:
```
.env.local
```
