# Using the app

## See it working right now

I've seeded a demo salon with real data and real photos — open:

```
http://localhost:3000/salon/demo-salon
```

(or `https://your-deployed-url/salon/demo-salon` once it's live). That's
exactly what a customer sees after scanning a QR code: logo, two combo
offers, and eight services across Hair/Beard/Skin categories — no login
involved. This row lives in your real Supabase database under a
placeholder owner, purely as a live reference; it won't show up in your
own admin dashboard since it isn't owned by your account.

## As the salon owner

1. **Sign in** — go to `/admin/login` and either continue with Google or
   create an account with email + password.
2. **Create your salon** — first time in, you'll see "Set up your salon":
   give it a name and a URL slug (e.g. `royal-gents-salon` →
   `/salon/royal-gents-salon`, the address a customer's QR code will point
   to). This is one-time.
3. **You land on the dashboard** — shows your service/offer counts with
   links into each.
4. **Add services** (`/admin/services`) — "+ Add service": name, category
   (e.g. "Hair", "Beard", "Skin" — services are grouped by whatever
   category text you type, so keep spelling consistent), price, an
   optional photo, and an Active checkbox. Uncheck **Active** to hide a
   service from customers without deleting it — useful for something
   seasonal or temporarily paused. Edit or Delete any service from the
   same list.
5. **Add offers** (`/admin/offers`) — same idea, plus an optional original
   price (shown struck through) and an optional expiry date. An expired
   offer stops showing to customers automatically — no manual cleanup.
6. **Settings** (`/admin/settings`) — logo, phone, WhatsApp number,
   address, opening hours, and your **QR code**: it encodes the permanent
   public URL, so you print it once and it keeps working even as you keep
   editing services/offers — nothing to reprint. "Copy link" and "Print"
   buttons are right there.

## As a customer

Scan the QR → land straight on `/salon/[slug]` on their phone → see the
logo, current offers, services grouped by category with prices, and Call /
WhatsApp buttons plus the address. No account, no app, no waiting.

## Multiple salons

Every owner gets exactly one salon in V1 (see `docs/architecture.md` §
V1 scope), but the schema is already multi-tenant — a second owner signing
up gets their own independent salon at their own slug, automatically.
