# DESIGN.md

`shiromatz.com`（プロフィールページ）のデザインシステムと実装方針をまとめたドキュメント。
UIを変更する際は、まずここを読んでトークンとコンポーネントの規約に沿うこと。

- **公開URL**: https://shiromatz.com/
- **デプロイ**: GitHub Pages（`shiromatz/shiromatz.github.io` の `main` ブランチ `/docs`、Jekyll legacy build）
- **このファイルの場所**: リポジトリ直下（`/docs` 配下ではないため公開サイトには含まれない）

---

## 1. コンセプト

**Data-driven editorial** — 25年以上のキャリアを持つデータサイエンティストにふさわしい、
知的で落ち着き、かつ記憶に残るエディトリアル（雑誌的）トーン。

- 表情のあるセリフ見出し × 等幅フォントのアクセントで「データの人」らしさを表現
- インクネイビーのダーク基調に、**琥珀（amber）1色**を鋭いアクセントとして使用
- 余白とセクション番号でリズムを作り、水平線（`<hr>`）の連発による単調さを排除
- "AIスロップ"フォント（Inter / Roboto / Arial 等）と紫グラデは使わない

派手さではなく**意図と精度**で勝負する方向。装飾は最小限、効くところに集中。

---

## 2. カラートークン

すべて CSS カスタムプロパティ（`:root`）で定義し、`prefers-color-scheme` でライト/ダークを自動切替する。
**色は必ずトークン経由で参照すること**（生の hex を新規に書かない）。

### Dark（デフォルト）
| トークン | 値 | 用途 |
|---|---|---|
| `--bg` | `#0d1014` | ページ背景のベース |
| `--bg-2` | `#12161c` | 背景グラデの上端 / ファビコン地 |
| `--surface` | `#161b22` | カード・タグ面 |
| `--surface-2` | `#1c222b` | カードのグラデ下端 |
| `--line` | `#262d38` | 標準ボーダー |
| `--line-soft` | `#1e242d` | 控えめな区切り線 |
| `--text` | `#e9eef4` | 本文・主要テキスト |
| `--muted` | `#9aa6b4` | 補助テキスト |
| `--faint` | `#6b7686` | ラベル・注記 |
| `--accent` | `#f2b441` | アクセント（琥珀） |
| `--accent-2` | `#ffd27d` | アクセント明（ハイライト） |
| `--accent-ink` | `#1a1206` | アクセント面上の文字色 |

### Light（`prefers-color-scheme: light`）
温かみのあるペーパー基調に切替。アクセントはコントラスト確保のため濃いめの琥珀。

| トークン | 値 |
|---|---|
| `--bg` / `--bg-2` | `#f4f1ea` / `#efebe2` |
| `--surface` / `--surface-2` | `#fffdf8` / `#faf7f0` |
| `--line` / `--line-soft` | `#e0d9c9` / `#ebe5d8` |
| `--text` / `--muted` / `--faint` | `#1c1a16` / `#5d5648` / `#938b79` |
| `--accent` / `--accent-2` / `--accent-ink` | `#b9791a` / `#8a5a10` / `#fffaf0` |

> 半透明の重ね合わせは `color-mix(in srgb, var(--accent) NN%, transparent)` で生成し、
> テーマ追従を保つ。

---

## 3. タイポグラフィ

Google Fonts から3書体（`display=swap`）。役割を厳密に分けて使う。

| トークン | 書体 | 役割 |
|---|---|---|
| `--serif` | **Fraunces** (600/italic) | 見出し（名前・セクションタイトル）、統計数値、リード強調 |
| `--sans` | **Public Sans** | 本文・カード文・タグ |
| `--mono` | **JetBrains Mono** | ラベル、年数、セクション番号、期間、メタ情報 |

規約:
- 見出しは `--serif` の `font-weight: 600`、`letter-spacing: -.02em` 前後で締める
- 役割ラベル（eyebrow / `card__tag` / `skillgrp__label` / `stat__label`）は `--mono` +
  `text-transform: uppercase` + `letter-spacing: .1em〜.22em`
- 役職名・引用的な一文は `--serif` の italic
- 見出しサイズは `clamp()` で流動化（例: `hero__name` は `clamp(2.1rem, 7vw, 3.4rem)`）

---

## 4. レイアウト

- コンテナ最大幅 `--maxw: 860px`、中央寄せ。パディングは `clamp()` で可変
- 角丸の基準 `--r: 14px`
- 共通ヘッダー `.sitebar` は帯のみ viewport 幅いっぱいに伸ばし、内側のリンク位置を本文幅に揃える
- セクションは `section.section` 単位。見出しは `.section__head`（`.section__no` 連番 + `.section__title`）
- 縦リズムはセクション間マージン `clamp(44px, 8vw, 76px)` と下線で作る（`<hr>` は使わない）

### 主要コンポーネント
| クラス | 役割 |
|---|---|
| `.hero` | About などの写真 + 名前 + 肩書 + 紹介 + メタ。2カラム→680px以下で1カラム |
| `.hero--home` | トップページ用の写真なしヒーロー。名前・肩書・短い紹介のみ |
| `.stats` / `.stat` | 統計バンド（4値）。`stat__num span` を琥珀に。380px以下で1カラム |
| `.cards` / `.card` | 実績カード。左の琥珀レール（`::before`）+ `.card__tag` + 本文。非リンクカードなのでhover移動は付けない |
| `.timeline` / `.tl` | 経歴の縦タイムライン。`.tl--now` は発光ノード（現職） |
| `.skillset` / `.skillgrp` / `.tags` / `.tag` | スキルのグループ別ピル。`.tag--strong` は主力（濃ボーダー）、`.tag em` は年数（mono） |
| `.linklist` (`--tight`) | 資格・特許の縦リンク列。hoverで左インデント |
| `.lead` / `.note` | セクション直下の概要文 / 小さな注記 |
| `.list` | `›`(琥珀)始まりの素朴な箇条書き |
| `.duo` | 短いセクションの2カラム（Languages / Education） |
| `.lang-pill` | コンテンツの言語ラベル。`EN` / `JA` / `EN-JA` のいずれかを表示 |
| `.home-links` / `.home-link` | トップページの説明付き導線。カードやボタンにせず、罫線リストとして控えめに見せる |
| `.project-grid` / `.project-card` | Projects の実項目カード。言語ラベル、種別、タイトルリンク、英日説明を持つ |
| `.article-grid` / `.article-card` | Writing の記事カード。媒体、タイトル直リンク、概要、右上の言語ラベルを持つ |
| `.foot` | フッター（mono、小） |

### コンテンツと言語ラベル

`Projects` / `Writing` など、英語・日本語のコンテンツが混在する一覧では、
各項目に言語ラベルを付ける。完全翻訳を前提にせず、原文言語を明示して整理する。

使用する表記は以下に統一する。

| ラベル | 意味 |
|---|---|
| `EN` | 英語のみ、または英語を主言語とする項目 |
| `JA` | 日本語のみ、または日本語を主言語とする項目 |
| `EN-JA` | 英語・日本語の両方がある項目 |

規約:
- `JP` / `JPN` / `Bilingual` など、別表記を混在させない
- ラベルは項目タイトルまたはメタ情報の近くに置き、一覧をスキャンした時に分かるようにする
- Writing の記事カードでは `.article-card__top` の右上に `.lang-pill` を置く
- スタイルは `.lang-pill` を使う
- 片方の言語しかないことを欠点に見せない。必要ならもう一方の言語で1行説明を添える

---

## 5. モーション

- **ページロード**: トップレベル要素に `.reveal` を付与し、`@keyframes rise` で下から
  フェードイン。`nth-child` で段階的ディレイ（staggered, 〜10要素）
- **マイクロ**: 写真リフト、カード/タグ/ソーシャルの hover、位置チップの `pulse`
- 高インパクトな1回のロード演出を優先し、散発的な過剰アニメは避ける
- **`prefers-reduced-motion: reduce` を尊重**（reveal アニメは no-preference 時のみ適用）

---

## 6. アクセシビリティ

- 外部リンクは `target="_blank" rel="noopener"`
- アイコンリンクは `aria-label`、装飾SVGは `aria-hidden="true"`
- キーボード操作のため `:focus-visible` に琥珀のアウトライン
- カラーはダーク/ライト両方で本文コントラストを確保（補助色は役割を色だけに依存させない）

---

## 7. アセット方針

- **写真**: 正方形 512px JPEG（`docs/img/profile-512.jpg`、約29KB）。
  巨大原本を直接読ませない。再生成は 512px / quality 82 目安
- **アイコン**: ソーシャルは**インラインSVG**（`currentColor`）。ラスタPNGを増やさない
- **ファビコン**: ブランドの「S」モノグラム。`favicon.svg`（優先）/ `favicon.png` 256px /
  `apple-touch-icon.png` 180px。地 `#12161c`・字 `#f2b441`
- 不要になったラスタ資産は残さず削除する

---

## 8. ファイル構成

```
docs/
├── _config.yml              # Jekyll 設定（remote_theme: minima, GA）
├── _layouts/
│   └── profile.html         # 専用レイアウト（Minimaの header/footer を上書き回避）
├── assets/css/
│   └── profile.css          # デザインシステム本体（トークン+コンポーネント）
├── index.md                 # layout: profile。本文はセマンティックHTML
├── favicon.svg / favicon.png / apple-touch-icon.png
└── img/profile-512.jpg
```

- スタイルは `profile.css` に集約（`index.md` にインライン `<style>` を書かない）
- ローカルの `_layouts/profile.html` は remote theme(minima) より優先されるため、
  ページ全体のHTMLを完全制御できる（サイトヘッダー/フッターの混入なし）

---

## 9. ローカルでの確認・ビルド

Ruby は `C:\Ruby33-x64`。

```powershell
$env:Path = "C:\Ruby33-x64\bin;" + $env:Path
cd C:\Users\shiro\dev\github-profile

# 単発ビルド
bundle exec jekyll build -s docs -d docs\_site

# 自動再生成（編集しながら確認）
bundle exec jekyll serve -s docs --livereload
```

- `docs/_site/` はビルド成果物（`.gitignore` 済み、コミットしない）
- 本番は push 後に GitHub Pages がリモートでビルドする（ローカルビルドはあくまで確認用）
- デプロイ確認: `gh api repos/{owner}/{repo}/pages/builds/latest --jq '.status'` が `built` になればOK

---

## 10. 変更時のチェックリスト

- [ ] 新しい色は生hexで書かず、既存トークン or `color-mix()` で表現したか
- [ ] フォントは役割（serif/sans/mono）どおりに使ったか
- [ ] 見出しサイズ・余白は `clamp()` で流動化したか
- [ ] ダーク/ライト両モードで確認したか（`prefers-color-scheme`）
- [ ] モバイル幅（〜680px / 〜380px）で崩れないか
- [ ] `prefers-reduced-motion` を壊していないか
- [ ] 追加画像は最適化済みか、不要アセットを残していないか
- [ ] 外部リンクの `rel="noopener"`、SVGの `aria` 属性
- [ ] 英語・日本語が混在する一覧項目に `EN` / `JA` / `EN-JA` の言語ラベルを付けたか
