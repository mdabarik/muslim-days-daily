# Muslim Days project map

Muslim Days app-এর সব কাজ তিনটি repository ঘিরে পরিচালিত হবে।

1. **`mdabarik/muslim-days-daily` — central operations repository**
   - Architecture decisions ও technical notes
   - Dependency map ও service inventory
   - Quiz/content plans ও delivery history
   - Graphics, campaign assets এবং brand materials
   - Facebook promotion plan, copy ও campaign tracking
   - Official Facebook page: https://www.facebook.com/profile.php?id=61595709925575
   - Product roadmap, release notes এবং operational documentation
2. **`mdabarik/push-notifications` — messaging repository**
   - Push admin page, content/message templates, sending guide
   - Cloudflare Worker, Firebase messaging, KV-backed content
3. **`mdabarik/muslim-days` — production application**
   - App source code, runtime architecture, features, builds ও releases
   - Repository: https://github.com/mdabarik/muslim-days

নতুন operational artifact প্রথমে central repository-র উপযুক্ত folder-এ যাবে। Runtime code main codebase-এ এবং push infrastructure `push-notifications`-এ থাকবে। প্রয়োজন হলে central repo থেকে তাদের documentation বা live URL link করা হবে।

## Promotion channel

- **Muslim Days Facebook page:** https://www.facebook.com/profile.php?id=61595709925575
- Facebook campaign creative, copy, publishing plan ও performance notes central `muslim-days-daily` repository-তে রাখা হবে।
