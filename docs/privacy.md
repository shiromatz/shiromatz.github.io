---
layout: profile
title: Privacy | Shiro Matsumoto
permalink: /privacy/
description: How this website measures page views and link clicks, in English and Japanese.
---

<header class="pagelead reveal">
  <p class="hero__eyebrow">Privacy</p>
  <h1 class="hero__name privacy-title">Privacy / <span lang="ja">プライバシー</span></h1>
</header>

<section class="section section-body reveal" lang="en" aria-labelledby="privacy-en">
  <h2 id="privacy-en">English</h2>
  <p>This website uses PostHog to understand which pages and selected links are useful. It records page views and clicks on selected navigation, project, article and profile/contact links, together with the page, a fixed link identifier, referring hostname, event time and an estimated country. It does not record the referring page's path, URL queries or fragments, link text, message contents, precise location, or audio.</p>
  <p>PostHog receives your IP address and browser User Agent to calculate a hash that changes daily and is specific to this website. These values are removed from the event before storage. No analytics identifier is saved in cookies, localStorage or sessionStorage. Person profiles, session recordings and automatic click collection are disabled. Counts do not establish a person's identity, unique visitors over several days, or the same person across my services.</p>
  <p>For the country estimate, your browser makes one request per page to an independently deployed country service hosted on Vercel. Vercel receives the connection's IP address and returns only an estimated country code. This request sends no cookies, referrer, page URL, message or link contents. The estimate may reflect a VPN or proxy; unavailable countries are recorded as Unknown. PostHog receives the country code and country name, not city, coordinates or GPS data.</p>
  <p>Analytics events are sent to PostHog Cloud in the United States. Google Analytics is not used. This website also loads fonts from Google Fonts, which receives the ordinary connection information needed to serve those files. Other sites opened through links have their own privacy practices. Blocking analytics does not prevent using this website.</p>
  <p>See <a href="https://posthog.com/privacy" rel="noopener">PostHog's privacy notice</a> and <a href="https://vercel.com/legal/privacy-policy" rel="noopener">Vercel's privacy notice</a>.</p>
</section>

<section class="section section-body reveal" lang="ja" aria-labelledby="privacy-ja">
  <h2 id="privacy-ja">日本語</h2>
  <p>このサイトでは、役立つページやリンクを把握するためにPostHogを使用します。ページの閲覧と、指定したナビゲーション・プロジェクト・記事・プロフィール／連絡先リンクのクリックを記録します。記録する情報は、閲覧ページ、固定のリンク識別子、参照元のホスト名、発生日時、IPアドレスから推定した国です。参照元ページのパス、URLのクエリやフラグメント、リンクの文章、メッセージの内容、正確な位置、音声は記録しません。</p>
  <p>PostHogは、通信時に受け取るIPアドレスとブラウザのUser Agentから、このサイト専用の日ごとに変わるハッシュを生成します。元の値はイベントの保存前に削除されます。解析用の識別子をCookie・localStorage・sessionStorageに保存しません。利用者プロフィール、画面録画、自動クリック収集は無効にしています。集計値から個人、複数日にわたる重複なしの人数、別サービスとの同一人物を特定することはできません。</p>
  <p>国の推定には、Vercel上で独立して運用する国判定サービスを使います。ブラウザはページごとに1回問い合わせ、Vercelが接続元のIPアドレスから推定した国コードだけを受け取ります。この問い合わせにCookie、参照元、閲覧ページのURL、メッセージやリンクの内容は含めません。VPNやプロキシにより実際の所在地と異なる場合があり、取得できない国はUnknownとして扱います。PostHogに追加する位置情報は国コードと国名だけで、市区町村、座標、GPS情報は送りません。</p>
  <p>解析イベントの送信先は米国のPostHog Cloudです。Google Analyticsは使用しません。また、表示用のフォントをGoogle Fontsから読み込む際には、配信に必要な通常の接続情報がGoogleへ送られます。リンク先の外部サイトには、それぞれのプライバシー方針が適用されます。解析の通信をブロックしても、このサイトは利用できます。</p>
  <p><a href="https://posthog.com/privacy" rel="noopener">PostHogのプライバシー説明</a>と<a href="https://vercel.com/legal/privacy-policy" rel="noopener">Vercelのプライバシー説明</a>も参照できます。</p>
</section>

<footer class="foot reveal"><span>© Shiro Matsumoto</span></footer>
