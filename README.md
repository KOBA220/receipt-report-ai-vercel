# Receipt AI Reports

React + TypeScript + Viteで作成した、スマホ対応の領収書管理Webアプリです。領収書画像をVercel Function経由でAnthropic Claude APIへ送り、店舗名・金額・日付を抽出します。APIキーはブラウザへ配信されません。

## 主な機能

- レポート一覧、作成、詳細画面
- スマホカメラ撮影、画像選択、プレビュー、送信用画像圧縮
- Claude Messages APIとStructured Outputsによる領収書解析
- 合計金額の自動計算、LocalStorage保存、CSVダウンロード
- PWA、ローディング表示、エラーハンドリング

## ローカル起動

Node.js 20以降を使用してください。

```bash
npm install
```

`.env.example`をコピーして`.env`を作り、サーバー専用APIキーを設定します。

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

```bash
npm run dev
```

`http://localhost:5173`を開きます。`.env`は`.gitignore`対象です。`VITE_`で始まる変数へAPIキーを入れないでください。

## GitHubへ公開

1. GitHubで空のリポジトリを作成します。
2. このフォルダで次を実行します。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
git push -u origin main
```

`.env`やAPIキーはコミットしないでください。

## Vercelへ公開

1. [Vercel](https://vercel.com/)へGitHubアカウントでログインします。
2. **Add New > Project**からGitHubリポジトリをImportします。
3. Framework Presetが`Vite`、Build Commandが`npm run build`、Output Directoryが`dist`であることを確認します。
4. Project Settingsの**Environment Variables**に次を登録します。
   - `ANTHROPIC_API_KEY`: Anthropic APIキー
   - `ANTHROPIC_MODEL`: `claude-sonnet-4-6`（省略可）
5. Production、Preview、Developmentの必要な環境へ適用し、Deployします。

以後は`main`ブランチへpushするとVercelが自動で再デプロイします。

## 公開運用の注意

- APIキー自体はVercel Function内に保持されますが、匿名公開APIは第三者から呼び出される可能性があります。Vercel Firewallのレート制限や認証を追加し、Anthropic側の使用量上限も設定してください。
- 領収書画像は解析時にAnthropic APIへ送信されます。個人情報を含む画像の取り扱い方針を利用者へ明示してください。
- レポートと圧縮後画像は端末のLocalStorageにだけ保存されます。端末間同期やバックアップ機能はありません。
- カメラ利用にはHTTPSが必要です。Vercelの公開URLはHTTPSに対応しています。

## コマンド

```bash
npm run dev
npm run lint
npm run build
npm run preview
```
