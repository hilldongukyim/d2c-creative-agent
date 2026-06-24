# Twin Crew Portal

D2C Creative Agent Portal — Twin Crew (LG Electronics D2C 팀 내부 AI 에이전트 허브)

## Stack

- **Frontend**: Vite + React 18 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (DB, Auth, Realtime)
- **Deploy**: GitHub Pages (`gh-pages` branch, GitHub Actions)

## Local dev

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # production build → dist/
```

## Environment variables

복사 후 값 설정:

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

## Deploy

`main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.

**배포 URL**: `https://hilldongukyim.github.io/d2c-creative-agent/`

**GitHub 설정 필요사항**:
1. Settings → Pages → Source: **GitHub Actions** 선택
2. Settings → Secrets → Actions에 아래 두 시크릿 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

## Pages

| 경로 | 페이지 |
|------|--------|
| `/` | CoverPage (메인) |
| `/promotional` | PromotionalWorkflow |
| `/tasks` | TaskOverview |
| `/pip-qa` | PipQA |
| `/allen-qa` | AllenQA |
| `/crawling` | Crawling |
| `/maple-pdp` | MaplePDP |
| `/milo-ecrm` | MiloECRM |
| `/zoe-camera/:sessionId` | ZoeCamera |

## Notes

- `src/integrations/supabase/` — Supabase client 및 자동생성 타입
- `.github/workflows/deploy.yml` — GitHub Pages 자동 배포
- `public/404.html` + `index.html` SPA 라우팅 스크립트 — GitHub Pages에서 client-side routing 지원
