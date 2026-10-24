# Muslim Days Daily

Muslim Days app-এর central operations repository। এখানে architecture notes, dependencies, quiz/content planning, graphics, Facebook promotion, campaign assets এবং notification delivery history ধাপে ধাপে রাখা হবে। সম্পূর্ণ repository map: [docs/PROJECT-MAP.md](docs/PROJECT-MAP.md)।

## Repository family

1. [`mdabarik/muslim-days-daily`](https://github.com/mdabarik/muslim-days-daily) — central operations, content, creative ও planning
2. [`mdabarik/push-notifications`](https://github.com/mdabarik/push-notifications) — push admin, Cloudflare Worker ও Firebase messaging
3. [`mdabarik/muslim-days`](https://github.com/mdabarik/muslim-days) — production app source, features, builds ও releases

## Promotion channel

- [Muslim Days Facebook page](https://www.facebook.com/profile.php?id=61595709925575) — official Facebook promotion ও audience communication

## Current contents

- Quiz 3–7 JSON files in `quizzes/`
- Five 1200×630 images in `quizzes/images/`
- Searchable quiz cards and local delivery history UI
- Date, type and keyword filters; JSON export
- Active/resolved ticket management for features, updates, bugs, content and promotion
- GitHub Pages-ready static site with no build dependency

## Add content

Quiz JSON/image যোগ করে `data/quiz-list.json`-এ card metadata দিন। Shared sent history `data/delivery-history.json`-এ রাখুন। Website থেকে যোগ করা record browser-এ থাকে; **Export JSON** দিয়ে download করে shared file replace করা যায়।

Ticket management page: `tickets.html`। Shared tickets `data/tickets.json`-এ থাকে। Page থেকে নতুন ticket যোগ, edit, resolve/reopen ও filter করা যায়; **Export JSON** দিয়ে team-এর shared file update করা যায়।

## Run

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>. For GitHub Pages, select **Settings → Pages → Build and deployment → Deploy from a branch**, then choose **main** and **/(root)**. Live URL: `https://mdabarik.github.io/muslim-days-daily/`.
