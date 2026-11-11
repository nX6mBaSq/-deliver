# CTAセクション 実装指示書

対象はトップページの問い合わせ欄（`#cta`）。[390px幅の確認画像](./CTA-mobile-390-v2.png) を参照する。

- CTAの背景、文言、ボタンの順序、既存のリンク先を引き継ぐ。
- 左端の見積り・電話・LINEのアイコンは、リポジトリに導入済みの Font Awesome Free 7.3.1 の SVG を使用する。淡いブルー（`--ds-tint-strong`）の40px角の面に、ブランドブルー（`--ds-brand`）の約20pxの図柄を中央に置く。確認画像では円形を採用。丸型は必須条件から外し、形状は3ボタンで揃える。
- 右端にも全ボタンでアイコンを配置する。右余白、16px角の配置枠、中央の高さを揃え、約12pxの図柄をブランドブルーで表示する。見積りの右端は、新しいタブで開くことを示す外部リンクのアイコンとする。

| ボタン | 左端の Font Awesome アイコン | 右端の Font Awesome アイコン |
| --- | --- | --- |
| 無料見積りフォーム | `fa-file-pen` | `fa-arrow-up-right-from-square` |
| 電話 | `fa-phone` | `fa-chevron-right` |
| LINE | `fa-comment` | `fa-chevron-right` |

インラインSVGには既存サイトと同様に Font Awesome Free のライセンス表記を添える。アイコンのラッパーは `aria-hidden="true"` とし、既存の読み上げ用文言を引き継ぐ。LINEのリンク先は現状の仮設定として扱う。
